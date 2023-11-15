const os = require('os')

export function checkAcrylicSupport(){
  return os.platform() === 'win32' && parseInt(os.release().split('.')[0]) >= 10
}
