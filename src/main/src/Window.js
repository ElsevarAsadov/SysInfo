import { app, shell, screen, ipcMain, globalShortcut, Tray, BrowserWindow } from 'electron'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { BrowserWindow as AcrylicBrowserWindow } from 'electron-acrylic-window'
import { checkAcrylicSupport, getWindowPositions, lerp } from "../../helpers/helpers";
import path from 'path'
import SystemInformationService from "./Services/SystemInformationService";
import icon from '../../../resources/icon.png?asset'

//const frameRate = parseInt(process.env['ANIMATION_FPS'])
const frameRate = import.meta.env.MAIN_VITE_ANIMATION_FPS


export default class App {
  constructor() {
    /**
     * @type BrowserWindow
     */
    this.mainWindow

    /**
     * @type Number
     */
    this.currentX

    /**
     * @type Number
     */
    this.currentY

    /**
     * @type SystemInformationService
     */
    this._sysInfoInstance;

    this.windowAnimationState = 'out'
    this.isWindowInViewPort = true
    this.animationInterval = null

    // setInterval(()=>{
    //   console.log(this.sysInfoService.gpuInfo)
    // }, 2000)
  }

  start() {
    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.

    app.whenReady().then(() => {

      // Set app user model id for windows
      electronApp.setAppUserModelId('com.electron')

      // Default open or close DevTools by F12 in development
      // and ignore CommandOrControl + R in production.
      // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
      app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window)
      })

      this._initAppTray()
      this._listenChannels()
      this._initShortcuts()
      this._createWindow()

      app.on('activate', function() {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) {
          this._createWindow()
        }
      })
    })

    // Quit when all windows are closed, except on macOS. There, it's common
    // for applications and their menu bar to stay active until the user quits
    // explicitly with Cmd + Q.
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit()
      }
    })
  }

  _initShortcuts() {
    globalShortcut.register('Alt+X', () => this._toggleWindowAnimation())
  }
  

  _initAppTray(){
    //initialize application task bar icon
    const trayHandler = new Tray(path.join('resources', 'icon.png'))
    trayHandler.setToolTip('SysInfo')
    trayHandler.on('click', () => this._toggleWindowAnimation())
  }

  _toggleWindowAnimation() {
    /* ---+ TODO: check if user uses any application which is fullscreen and do height resizing according +--- */
    const {x, y, display_width, display_height} = getWindowPositions()

    //x, y positions of window for each animation state. each represents where window goes in the end of animation
    const targetPositions = {
      in: {
        x: x,
        y: 0
      },
      out: {
        x: display_width + 200,
        y: 0
      }
    }

    //if animation is not allowed then do not nothing
    if (!this.isWindowInViewPort) return

    //block further animation
    this.isWindowInViewPort = false

    //animation bouncing.after 400ms remove animation block
    setTimeout(() => {
      this.isWindowInViewPort = true
    }, 400)

    //if already animation runs then remove it
    if (this.animationInterval) {
      clearInterval(this.animationInterval)
    }

    //toggle animation state
    this.windowAnimationState = this.windowAnimationState === 'out' ? 'in' : 'out'
    this.currentX = this.mainWindow.getPosition()[0]
    this.currentY = this.mainWindow.getPosition()[1]

    this.animationInterval = setInterval(() => {
      const [targetX, targetY] = [
        targetPositions[this.windowAnimationState].x,
        targetPositions[this.windowAnimationState].y
      ]

      this.currentX = lerp(this.currentX, targetX, (1 / frameRate) * 5)
      this.currentY = lerp(this.currentY, targetY, (1 / frameRate) * 5)

      this.mainWindow.setPosition(Math.round(this.currentX), Math.round(this.currentY))

      if (Math.round(this.currentX) === targetX && Math.round(this.currentY) === targetY) {
        clearInterval(this.animationInterval)
      }
    }, 1000 / frameRate)
  }

  _createWindow() {

    const {x, y,  display_height, workingAreaHeight} = getWindowPositions()

    const generalWindowOptions = {
      width:   parseInt(import.meta.env.MAIN_VITE_WINDOW_WIDTH),
      height: display_height, //fulheight
      show: false,
      x: x * 2,
      y: y,
      movable: false,
      resizable: false,
      skipTaskbar: true,
      transparent: true,
      frame: false,
      alwaysOnTop: true,
      autoHideMenuBar: true,
      acceptFirstMouse: true,
      disableOnBlur: true,
      focusable: is.dev,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        sandbox: false
      }
    }
    const vibrancyWindowOptions = {
      theme: '#22222299',
      effect: 'acrylic',
      maximumRefreshRate: 60,
      disableOnBlur: false
    }

    //if platform is windows and version is 10 and above make window Arclyic style (transparent)
    if (checkAcrylicSupport()) {

      this.mainWindow = new AcrylicBrowserWindow(generalWindowOptions)
      this.mainWindow.setVibrancy(vibrancyWindowOptions)

    }
    else {
      this.mainWindow = new BrowserWindow(generalWindowOptions)
    }

    this.mainWindow.on('ready-to-show', () => {
      this.mainWindow.show()
      //which indicates open window when first launch application
      this._toggleWindowAnimation()

      this._sysInfoInstance = SystemInformationService.getInstance()
      this._sysInfoInstance.getSystemInformation()
        .then(()=>{
          const sysData = {
            "osInfo" : this._sysInfoInstance.osInfo,
            "cpuInfo" : this._sysInfoInstance.cpuInfo,
            "gpuInfo" : this._sysInfoInstance.gpuInfo,
            "memoryInfo" : this._sysInfoInstance.memoryInfo
          }
          this._sendToRenderer('main.get-sys-info', sysData, false)
        })
        .catch(err=>{
          //TODO ...
          console.error(err)
          setTimeout(()=>{process.exit(1)}, 2000)
        })


      screen.on("display-metrics-changed", ()=>{
        const {x, y, display_width, display_height, workingAreaHeight} = getWindowPositions()
        this._sendToRenderer("main.set-height", workingAreaHeight, false)
        //if animation runs cut it off
        clearInterval(this.animationInterval);

        //always be on the right left side even the active window changes
        this.mainWindow.setPosition(this.windowAnimationState === 'out' ? x * 2 : x, y)
        //always keep the size if active display changes
        //electron bug --> https://github.com/electron/electron/issues/15560
        this.mainWindow.setMinimumSize(300, display_height);
        this.mainWindow.setSize(300, display_height);

      })
    })

    this.mainWindow.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url)
      return { action: 'deny' }
    })

    // HMR for renderer base on electron-vite cli.
    // Load the remote URL for development or the local html file for production.
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      this.mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
      this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
    }
  }

  _listenChannels() {
    //event type + event name
    ipcMain.handle('window.minimize', async() => {
     this._toggleWindowAnimation()
    })
    ipcMain.handle('window.destroy', () => {
      this.mainWindow.destroy()
    })
  }

  _sendToRenderer(msg, data, afterFinishLoad = true){
    if(afterFinishLoad === true){
      // Send a message to the renderer process after the window is ready
      this.mainWindow.webContents.on('did-finish-load', async() => {
        this.mainWindow.webContents.send(msg, data);
      });
    }
    else{
      this.mainWindow.webContents.send(msg, data);
    }

  }
}
