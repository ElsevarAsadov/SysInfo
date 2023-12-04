const electron = require('electron')
const os = require('os');

export function checkAcrylicSupport(){
  //check it is windows 10 or above
  return os.platform() === 'win32' && parseInt(os.release().split('.')[0]) >= 10
}

export function getWindowPositions(){

      const workingAreaWidth = electron.screen.getPrimaryDisplay().workAreaSize.width
      const workingAreaHeight = electron.screen.getPrimaryDisplay().workAreaSize.height

      //these are active window's width and height
      const display_width = electron.screen.getPrimaryDisplay().size.width
      const display_height = electron.screen.getPrimaryDisplay().size.height

      const x = display_width - parseInt(import.meta.env.MAIN_VITE_WINDOW_WIDTH);
      const y = 0

      return {x, y, display_width, display_height, workingAreaWidth, workingAreaHeight}
}


//standard lerp function makes smooth movement
export function lerp(start, end, t) {
  return start + t * (end - start)
}

