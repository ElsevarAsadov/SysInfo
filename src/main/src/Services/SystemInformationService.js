const si = require('systeminformation')
const dedent = require('dedent')


/* Singleton Pattern:

  Since getting system information is expensive (it tooks some seconds ~= 2, 3 secs)
  and it is static (mean the system information will not change in the application runtime)
  there is no need to perform expensive information call everytime

  BE CAREFUL SINCE SINGLETON INSTANCE LOCATION IS IN MEMORY OF PROCESS WHICH CREATES IT YOU CANNOT
  ACCESS IT THROUGH RENDERER PROCESS.WE NEED TO CREATE IT IN MAIN PROCESS AND SEND WHOLE OBJECT TO RENDERER IN BOOTSTRAPPING STAGE

 */
export default class SystemInformationService {
  osInfo
  cpuInfo
  memoryInfo
  gpuInfo

  static _instance;

  constructor() {
    this._getSystemInformation()
  }
  static getInstance(){
    if(SystemInformationService._instance === undefined){
      SystemInformationService._instance =  new SystemInformationService()
    }
    return SystemInformationService._instance;
  }

  async _getSystemInformation() {
    try {
      ;[this.osInfo, this.cpuInfo, this.memoryInfo, this.gpuInfo] = await Promise.all([
        SystemInformationService.getCpuInfo(),
        SystemInformationService.getOSInfo(),
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
    const { manufacturer, brand, physicalCores, cores } = await si.cpu()
    return dedent`

    ${manufacturer ?? 'Unknown'} ${brand ?? 'Unknown'} ${physicalCores ?? 'Unknown'} \
    ${physicalCores > 1 ? 'Cores' : ' Core'}, ${cores ?? 'Unknown'} ${
      cores > 1 ? 'Threads' : 'Thread'
    }`
  }

  static async getOSInfo() {
    const { platform, release, arch } = await si.osInfo()
    return dedent`

      ${platform ?? 'Unknown'} ${release ?? 'Unknown'} ${arch ?? 'Unknown'}

    `
  }

  static async getMemInfo() {
    const [memInfo, memLayout] = await Promise.all([si.mem(), si.memLayout()])

    let { total } = memInfo

    //------- TODO: Make nice ui for multiple ram socket and show each ------

    const { type, clockSpeed } = memLayout[0]

    //------- ++++++++++++++++++++++++++++++++++++++++++++++++++++++++ ------

    total = SystemInformationService.convertByteToGb(total).toFixed(1)  // GB

    return dedent`

      ${total}GB ${type} ${clockSpeed}Mhz

    `
  }

  static async getGpuInfo(){
    let {controllers : [{name, vram}]} = await si.graphics()

    return dedent`

      ${name} ${vram}Mb

    `
  }

  static convertByteToGb(byte) {
    return byte / 1024 ** 3
  }

}

//module.exports = SystemInformationService
