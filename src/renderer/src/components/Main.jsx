import { Box, Card, CardBody, CardHeader, Heading, Container, Stack, StackDivider, } from "@chakra-ui/react";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { IoLogoWindows } from 'react-icons/io'
import { FaMemory } from 'react-icons/fa'
import { BsFillCpuFill, BsGpuCard } from 'react-icons/bs'
import InfoBox from './InfoBox'
import { motion, stagger, useAnimate } from 'framer-motion'
import CpuChart from "./CpuChart";
import Loading from "./Loading";
import dedent from "dedent";
import { convertByteToGb } from "../../../helpers/functions";
import MemoryInfo from "./MemoryInfo";


const { ipcRenderer } = require('electron')

function Main() {
  const [scopeInfoTexts, animateInfoTexts] = useAnimate()
  const [scopeCharts, animateCharts] = useAnimate()
  const [infoData,setInfoData] = useState(
      {
        osInfo: null,
        memoryInfo: null,
        cpuInfo: null,
        gpuInfo : null,
      }
  );
  // Listen for a message from the main process to get system informations
  useLayoutEffect(()=>{
    ipcRenderer.on('main.get-sys-info', (event, data) => {
      const {manufacturer, brand, physicalCores, cores} = data.cpuInfo;
      const { platform, release, arch } = data.osInfo;

      let {controllers : [{name, vram}]} = data.gpuInfo;
      let [ memInfo, memLayout ] = data.memoryInfo
      let memoryInfo = {sockets: [], total: null};

        memLayout.forEach(mem=>{
            const { size, type, clockSpeed, manufacturer } = mem
            memoryInfo.sockets.push(`${convertByteToGb(size)}GB ${type} ${clockSpeed}Mhz ${manufacturer}`)
        })
        memoryInfo.total = `${convertByteToGb(memInfo.total).toFixed(1)}GB`

      const cpuInfo = dedent`
                ${manufacturer} ${brand} ${physicalCores} \
                ${physicalCores > 1 ? 'Cores' : ' Core'}, ${cores}
                ${cores > 1 ? 'Threads' : 'Thread'}`

      const osInfo = `${platform} ${release} ${arch}`

      const gpuInfo = `${name} ${vram}MB`;

      setInfoData({ cpuInfo, osInfo, gpuInfo, memoryInfo })

    })
  })

  useEffect(() => {
    if (infoData?.memoryInfo) {
      (async()=>{
        await animateInfoTexts('div', { opacity: 1}, { delay: stagger(0.2, )})
        await animateCharts('div', { opacity: 1 }, { delay: stagger(0.2) })
      })();
    }
  }, [infoData])

  return (
    <Container className={'w-full pl-2 pr-2 pt-5 h-full'}>

          <Loading sysInfos={infoData}/>

          <motion.div
          animate={{ opacity: infoData?.cpuInfo ? 1 : 0 }}
          initial={{opacity: 0}}
          transition={{ ease: 'easeOut', duration: 2 }}>


          <Card backgroundColor={'#d3cdcd'}>
            <CardHeader>
              <Heading size="md">System Overview</Heading>
            </CardHeader>


            <CardBody>
              <Stack divider={<StackDivider borderColor={'black'} />} spacing="4" ref={scopeInfoTexts} >
                <InfoBox headerText={'OS:'} info={infoData.osInfo} icon={IoLogoWindows} />
                <MemoryInfo headerText={'MEMORY:'} info={infoData.memoryInfo} icon={FaMemory} />
                <InfoBox headerText={'CPU:'} info={infoData.cpuInfo} icon={BsFillCpuFill} />
                <InfoBox headerText={'GPU:'} info={infoData.gpuInfo} icon={BsGpuCard} />
              </Stack>
            </CardBody>
          </Card>



          <Box
            ref={scopeCharts}
            height={'120px'}
            position={'relative'}
            marginBottom={'5%'}
            padding={'1%'}>

            <Box as={motion.div} initial={{ opacity: 0 }} height={'100%'}>

              <Heading
                textAlign={'center'}
                color={'white'}
                margin={'20px 0px'}>CPU
              </Heading>

              <CpuChart/>
            </Box>
          </Box>


        </motion.div>


    </Container>
  )
}

export default Main
