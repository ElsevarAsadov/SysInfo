const electron = require('electron')
const os = require('os');
const env = require('dotenv').config()

export function checkAcrylicSupport(){
  return os.platform() === 'win32' && parseInt(os.release().split('.')[0]) >= 10
}


export function getWindowSize(){

      const{width: display_width, height: display_height} = electron.screen.getPrimaryDisplay().workAreaSize
      const x = display_width - process.env.WINDOW_WIDTH;
      const y = 0


      //x, y, width, height
      return [x, y, display_width, display_height]
}
