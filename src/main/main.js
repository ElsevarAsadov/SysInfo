import App from "./src/Application"



// const SystemInformationService = require("./src/Services/SystemInformationService")
//
// const s = SystemInformationService.getInstance()
// const s2 = SystemInformationService.getInstance()


//SystemInformationService.getMemInfo().then(data=>console.log(data))

//process.exit()


// setTimeout(()=>{
//
//   console.log(s2.cpuInfo)
//   console.log(s.osInfo)
//   console.log(s2.memoryInfo)
//   console.log(s.gpuInfo)
//
// }, 5000)

//SystemInformationService.getGpuInfo().then(data=>console.log(data));



const app = new App()
app.startApplication()




