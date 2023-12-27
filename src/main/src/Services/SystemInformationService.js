const si = require('systeminformation')


/* Singleton Pattern:

  Since getting system information is expensive (it tooks some seconds ~= 2, 3 secs)
  and it is static (mean the system information will not change in the application runtime)
  there is no need to perform expensive information call everytime

  BE CAREFUL SINCE SINGLETON INTSANCE LOCATION IS IN MEMORY OF PROCESS WHICH CREATES IT YOU CANNOT
  ACCESS IT THROUGH RENDERER PROCESS.WE NEED TO CREATE IT IN MAIN PROCESS AND SEND WHOLE OBJECT TO RENDERER USING IPC DURING BOOTSTRAPPING STAGE

 */
export default class SystemInformationService {

  static _instance;

  osInfo
  cpuInfo
  memoryInfo
  gpuInfo

  _pointerToInformationGetter;

  constructor() {

    this._pointerToInformationGetter = this.getSystemInformation()
  }


  static getInstance(){
    if(SystemInformationService._instance === undefined){
      SystemInformationService._instance =  new SystemInformationService()
    }
    return SystemInformationService._instance;
  }

  async getSystemInformation() {

    //this code prevents multiple useless async call
    //this code should only one time called then we can use this information entire app life cycle
    if(this._pointerToInformationGetter){
      return this._pointerToInformationGetter
    }

    try {
      [this.osInfo, this.cpuInfo, this.memoryInfo, this.gpuInfo] = await Promise.all([
        SystemInformationService.getOSInfo(),
        SystemInformationService.getCpuInfo(),
        SystemInformationService.getMemInfo(),
        SystemInformationService.getGpuInfo()
      ])

    } catch (e) {
      // ---- TODO: Make communication between main and renderer to handle inner exceptions ---

      console.error(`Exception happened when getting system info\nException -> ${e}`)

      // ---- +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ ---
    }

  }

  static async getCpuInfo() {
    return await si.cpu()
  }

  static async getOSInfo() {
    return await si.osInfo()

  }

  static async getMemInfo() {
    return await Promise.all([si.mem(), si.memLayout()])
  }

  static async getGpuInfo(){
    return await si.graphics()
  }


}

