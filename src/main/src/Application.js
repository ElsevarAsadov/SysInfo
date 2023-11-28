import { app, shell, screen, ipcMain, globalShortcut, Tray, BrowserWindow } from 'electron'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { BrowserWindow as AcrylicBrowserWindow } from 'electron-acrylic-window'
import { checkAcrylicSupport, getWindowSize } from '../../helpers/helpers'
import path from 'path'
import icon from '../../../resources/icon.png?asset'
import SystemInformationService from "./Services/SystemInformationService";


//const frameRate = parseInt(process.env['ANIMATION_FPS'])
const frameRate = import.meta.env.MAIN_VITE_ANIMATION_FPS



/**
 * @type SystemInformationService
 */

const SYSTEM_INFORMATION = SystemInformationService.getInstance()


export default class App {
  constructor() {
    /**
     * @type {SystemInformationService}
     * Getting system information takes some seconds so information
     * properties can be undefined when app is bootstrapping (first few seconds)
     */
    this.sysInfoService = SystemInformationService.getInstance()

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

    this.windowAnimationState = 'out'
    this.isWindowInViewPort = true
    this.animationInterval = null

    // setInterval(()=>{
    //   console.log(this.sysInfoService.gpuInfo)
    // }, 2000)
  }

  startApplication() {

    // ---------------- BOOTSTRAPPING START ----------------

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


        //initialize application task bar icon
        const trayHandler = new Tray(path.join('resources', 'icon.png'))
        trayHandler.setToolTip('SysInfo')
        trayHandler.on('click', () => this._toggleWindowAnimation())

      })

      this._listenChannels()

      this._initShortcuts()


      // ++++++++++++++++++ BOOTSTRAPPING END ++++++++++++++++++

      this._createWindow()

      this._sendToRenderer()

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
  _toggleWindowAnimation() {
    /* ---+ TODO: check if user uses any application which is fullscreen and do height resizing according +--- */

    //standard lerp function makes smooth movement
    function lerp(start, end, t) {
      return start + t * (end - start)
    }

    const [x, y, width, height] = getWindowSize()

    //x, y positions of window for each animation state. each represents where window goes in the end of animation
    const targetPositions = {
      in: {
        x: x,
        y: 0
      },
      out: {
        x: width + 200,
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


    const [x, y, width, height] = getWindowSize()
    //if platform is windows and version is 10 and above make window Arclyic style (transparent)
    if (checkAcrylicSupport()) {
      const vibrancyWindowOptions = {
        theme: '#22222299',
        effect: 'acrylic',
        maximumRefreshRate: 60,
        disableOnBlur: false
      }

      this.mainWindow = new AcrylicBrowserWindow({
        width: width,
        height: height,
        show: false,
        x: screen.getPrimaryDisplay().workAreaSize.width + width,
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
      })

      this.mainWindow.setVibrancy(vibrancyWindowOptions)

    }
    else {
      this.mainWindow = new BrowserWindow({
        width: width,
        height: height,
        show: false,
        x: screen.getPrimaryDisplay().workAreaSize.width + width,
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
      })
    }

    this.mainWindow.on('ready-to-show', () => {
      this.mainWindow.show()

      //which indicates open window when first launch application
      this._toggleWindowAnimation()
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

  _sendToRenderer(){
    // Send a message to the renderer process after the window is ready
    this.mainWindow.webContents.on('did-finish-load', async() => {


      SYSTEM_INFORMATION.getSystemInformation()
        .then(()=>{
            this.mainWindow.webContents.send("main.get-sys-info", {
              "osInfo" : SYSTEM_INFORMATION.osInfo,
              "cpuInfo" : SYSTEM_INFORMATION.cpuInfo,
              "gpuInfo" : SYSTEM_INFORMATION.gpuInfo,
              "memoryInfo" : SYSTEM_INFORMATION.memoryInfo
            })

      })
        .catch(err=>{
          //TODO ...
          setTimeout(()=>{process.exit(1)}, 2000)
      })


    });
  }
}
