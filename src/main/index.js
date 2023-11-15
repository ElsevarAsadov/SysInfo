import { app, shell,screen, ipcMain, globalShortcut, Tray, BrowserWindow} from 'electron'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import {BrowserWindow as AcrylicBrowserWindow } from "electron-acrylic-window";
import { checkAcrylicSupport } from "../helpers/helpers";
import { join } from 'path'
import path from 'path'
import icon from '../../resources/icon.png?asset'

/**
 * @type BrowserWindow
 */
let mainWindow;
let windowAnimationState = 'out';
let canTriggerAnimation = true
let animationInterval;

function triggerAnimation(){

  /* ---+ TODO: check if user uses any application which is fullscreen and do height resizing according +--- */

  //standard lerp function makes smooth movement
  function lerp(start, end, t) {
    return start + t * (end - start);
  }

  //x, y positions of window for each animation state. each represents where window goes in the end of animation
  const targetPositions = {
    in : {
      x: 1060,
      y: 0,
    },
    out: {
      x: 2000,
      y: 0,
    }

  }

  //if animation is not allowed then do not nothing
  if(!canTriggerAnimation) return

  //block further animation
  canTriggerAnimation = false

  //animation bouncing.after 400ms remove animation block
  setTimeout(()=>{canTriggerAnimation = true}, 400)

  //if already animation runs then remove it
  if (animationInterval){
    clearInterval(animationInterval)
  }

  //toggle animation state
  windowAnimationState = windowAnimationState === 'out' ? 'in' : 'out'

  const frameRate = 60;

  let [currentX, currentY] = mainWindow.getPosition();

  animationInterval = setInterval(() => {
    const [targetX, targetY] = [targetPositions[windowAnimationState].x, targetPositions[windowAnimationState].y]

    currentX = lerp(currentX, targetX, 1 / frameRate * 5);
    currentY = lerp(currentY, targetY, 1 / frameRate * 5);
    mainWindow.setPosition(Math.round(currentX), Math.round(currentY));

    if (Math.round(currentX) === targetX && Math.round(currentY) === targetY) {
      clearInterval(animationInterval);
    }
  }, 1000 / frameRate);

}
function createWindow() {

  const primaryDisplay = screen.getPrimaryDisplay()
  const {width, height} = primaryDisplay.workAreaSize

  //if platform is windows and version is 10 and above
  const bs = checkAcrylicSupport() ? AcrylicBrowserWindow : BrowserWindow

  // Create the browser window.
    mainWindow = new bs({
      width: 300,
      height: height,
      show: false,
      x: 2000,
      y: 0,
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

  mainWindow.setVibrancy(options)

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    triggerAnimation()

    })



  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}
function listenChannels(){
  //event type + event name
  ipcMain.handle('window.minimize', ()=>{
    triggerAnimation()
  })
  ipcMain.handle('window.destroy', ()=>{
    mainWindow.destroy()
  })

}

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
  tray.on('click', triggerAnimation)

  createWindow()

  listenChannels()

  globalShortcut.register('Alt+X', triggerAnimation)

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
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

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
