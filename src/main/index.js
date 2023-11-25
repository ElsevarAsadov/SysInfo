import { app, shell,screen, ipcMain, globalShortcut, Tray, BrowserWindow} from 'electron'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import {BrowserWindow as AcrylicBrowserWindow } from "electron-acrylic-window";
import { checkAcrylicSupport, getWindowSize } from "../helpers/helpers";
import path from 'path'
import icon from '../../resources/icon.png?asset'


const frameRate = parseInt(process.env["ANIMATION_FPS"]);


class App {

  constructor() {

    /**
     * @type BrowserWindow
     */
    this.mainWindow;


    this.windowAnimationState = 'out';
    this.canTriggerAnimation = true;
    this.animationInterval = null;

    this.currentX
    this.currentY
  }


  initialize(){

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

      //application task bar icon
      const tray = new Tray(path.join('resources', 'icon.png'))
      tray.setToolTip('SysInfo')
      tray.on('click', ()=>this._triggerAnimation())

      this.createWindow()

      this.listenChannels()

      globalShortcut.register('Alt+X', ()=>this._triggerAnimation())

      app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0){
          this.createWindow()
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
  _triggerAnimation() {
    /* ---+ TODO: check if user uses any application which is fullscreen and do height resizing according +--- */

    //standard lerp function makes smooth movement
    function lerp(start, end, t) {
      return start + t * (end - start);
    }

    const [x, y, width, height] = getWindowSize()

    //x, y positions of window for each animation state. each represents where window goes in the end of animation
    const targetPositions = {
      in: {
        x: x,
        y: 0,
      },
      out: {
        x: width + 200,
        y: 0,
      }
    }



    //if animation is not allowed then do not nothing
    if (!this.canTriggerAnimation) return
    //block further animation
    this.canTriggerAnimation = false

    //animation bouncing.after 400ms remove animation block
    setTimeout(()=>{
      this.canTriggerAnimation = true
    }, 400)

    //if already animation runs then remove it
    if (this.animationInterval) {
      clearInterval(this.animationInterval)
    }

    //toggle animation state
    this.windowAnimationState = this.windowAnimationState === 'out' ? 'in' : 'out'



    this.currentX = this.mainWindow.getPosition()[0];
    this.currentY = this.mainWindow.getPosition()[1];


    this.animationInterval = setInterval(()=>{
      const [targetX, targetY] = [targetPositions[this.windowAnimationState].x, targetPositions[this.windowAnimationState].y]
      this.currentX = lerp(this.currentX, targetX, 1 / frameRate * 5);
      this.currentY = lerp(this.currentY, targetY, 1 / frameRate * 5);

      this.mainWindow.setPosition(Math.round(this.currentX), Math.round(this.currentY));


      if (Math.round(this.currentX) === targetX && Math.round(this.currentY) === targetY) {
        clearInterval(this.animationInterval);
      }
    }, 1000 / frameRate);

  }

  createWindow() {

    const [x, y, width, height] = getWindowSize()

    //if platform is windows and version is 10 and above
    const bs = checkAcrylicSupport() ? AcrylicBrowserWindow : BrowserWindow

    // Create the browser window.
    this.mainWindow = new bs({
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
      ...(process.platform === 'linux' ? { icon } : {}),
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        sandbox: false,
      },
    })

    const options = {
      theme: '#22222299',
      effect: "acrylic",
      maximumRefreshRate: 60,
      disableOnBlur: false,
    }

    this.mainWindow.setVibrancy(options)

    this.mainWindow.on('ready-to-show', ()=> {
      this.mainWindow.show()
      this._triggerAnimation()

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

  listenChannels(){


    //event type + event name
    ipcMain.handle('window.minimize', ()=>{
      this._triggerAnimation()
    })
    ipcMain.handle('window.destroy', ()=>{
      this.mainWindow.destroy()
    })

  }



}


const x = new App()
x.initialize()




