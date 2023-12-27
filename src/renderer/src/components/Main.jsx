import { Box, Card, CardBody, CardHeader, Heading, Container, Spinner, Stack, StackDivider, } from "@chakra-ui/react";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { IoLogoWindows } from 'react-icons/io'
import { FaMemory } from 'react-icons/fa'
import { BsFillCpuFill, BsGpuCard } from 'react-icons/bs'
import InfoBox from './InfoBox'
import { motion, stagger, useAnimate } from 'framer-motion'
import CpuChart from "./CpuChart";
import Loading from "./Loading";
import dedent from "dedent";
import { convertByteToGb } from "../../../helpers/helpers";
import MemoryInfo from "./MemoryInfo";

const { ipcRenderer } = require('electron')

function Main() {
  const [sysInfos, setSysInfos] = useState()
  const [scopeInfoTexts, animateInfoTexts] = useAnimate()
  const [scopeCharts, animateCharts] = useAnimate()
  const infoTexts = useRef(
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
      setSysInfos(data)

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
                ${manufacturer ?? 'Unknown'} ${brand ?? 'Unknown'} ${physicalCores ?? 'Unknown'} \
                ${physicalCores > 1 ? 'Cores' : ' Core'}, ${cores ?? 'Unknown'}
                ${cores > 1 ? 'Threads' : 'Thread'}`

      const osInfo = `${platform ?? 'Unknown'} ${release ?? 'Unknown'} ${arch ?? 'Unknown'}`

      const gpuInfo = `${name} ${vram}MB`;



      infoTexts.current = { cpuInfo, osInfo, gpuInfo, memoryInfo }



    })
  })

  useEffect(() => {
    if (sysInfos) {
      (async()=>{
        await animateInfoTexts('div', { opacity: 1 }, { delay: stagger(0.1, ) })
        await animateCharts('div', { opacity: 1 }, { delay: stagger(0.1) })
      })();
    }
  }, [sysInfos])

  return (
    <Container className={'w-full pl-2 pr-2 pt-5 h-full'}>

          <Loading sysInfos={sysInfos}/>


          <motion.div
          animate={{ opacity: sysInfos?.cpuInfo ? 1 : 0 }}
          initial={{opacity: 0}}
          transition={{ ease: 'easeOut', duration: 2 }}>


          <Card backgroundColor={'#d3cdcd'}>
            <CardHeader>
              <Heading size="md">System Overview</Heading>
            </CardHeader>



            <CardBody>
              <Stack divider={<StackDivider borderColor={'black'} />} spacing="4" ref={scopeInfoTexts} >
                <InfoBox headerText={'OS:'} info={infoTexts.current.osInfo} icon={IoLogoWindows} />
                <MemoryInfo headerText={'MEMORY:'} info={infoTexts.current.memoryInfo} icon={FaMemory} />
                <InfoBox headerText={'CPU:'} info={infoTexts.current.cpuInfo} icon={BsFillCpuFill} />
                <InfoBox headerText={'GPU:'} info={infoTexts.current.gpuInfo} icon={BsGpuCard} />
              </Stack>
            </CardBody>
          </Card>



          <Box
            ref={scopeCharts}
            height={'120px'}
            position={'relative'}
            marginBottom={'5%'}
            padding={'1%'}>

            <Heading
              textAlign={'center'}
              color={'white'}
              margin={'20px 0px'}>CPU</Heading>

            <Box as={motion.div} initial={{ opacity: 0 }} height={'100%'}>
              <CpuChart/>
            </Box>
          </Box>


        </motion.div>


    </Container>
  )
}

export default Main
