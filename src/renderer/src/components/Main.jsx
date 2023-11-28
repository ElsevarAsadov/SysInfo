import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Icon,
  Kbd, Spinner,
  Stack,
  StackDivider,
  Text
} from "@chakra-ui/react";
import React, { useEffect, useState } from 'react'
import { IoLogoWindows } from 'react-icons/io'
import { FaMemory } from 'react-icons/fa'
import { BsFillCpuFill, BsGpuCard } from 'react-icons/bs'
import InfoBox from './InfoBox'
import { animate, motion, stagger, useAnimate } from 'framer-motion'

const { ipcRenderer } = require('electron')

function Main() {
  // Listen for a message from the main process to get system informations
  ipcRenderer.on('main.get-sys-info', (event, object) => {
    setSysInfos(object)
  })

  const [sysInfos, setSysInfos] = useState()

  const [scope, animate] = useAnimate()

  useEffect(() => {
    if (sysInfos) {
      animate('div', { opacity: 1 }, { delay: stagger(0.1, {startDelay: 2}) })
    }
  }, [sysInfos])

  return (
    <Box className={'w-full h-full pl-2 pr-2 pt-5'}>

      <motion.div animate={{ opacity: sysInfos?.cpuInfo ? 0 : 1 }}
                  initial={{opacity: 1}}
                  transition={{ duration: sysInfos?.cpuInfo ? .1 : 2}}>
        <Stack
          position={'absolute'}
          top={'50%'}
          left={'50%'}
          transform={'translate(-50%, -50%)'}
          zIndex={100}
          justifyContent={'center'}
          alignItems={'center'}
        >
          <Spinner color='red.500' />
          <h1>Loading</h1>
        </Stack>
      </motion.div>

      <motion.div
        animate={{ opacity: sysInfos?.cpuInfo ? 1 : 0 }}
        initial={{opacity: 0}}
        transition={{ ease: 'easeOut', duration: 2 }}>

        <Card backgroundColor={'#d3cdcd'}>
          <CardHeader>
            <Heading size="md">System Overview</Heading>
          </CardHeader>

          <CardBody>
            <Stack divider={<StackDivider borderColor={'black'} />} spacing="4" ref={scope}>
              <InfoBox headerText={'OS:'} info={sysInfos?.osInfo} icon={IoLogoWindows} />
              <InfoBox headerText={'MEMORY:'} info={sysInfos?.memoryInfo} icon={FaMemory} />
              <InfoBox headerText={'CPU:'} info={sysInfos?.cpuInfo} icon={BsFillCpuFill} />
              <InfoBox headerText={'GPU:'} info={sysInfos?.gpuInfo} icon={BsGpuCard} />
            </Stack>
          </CardBody>
        </Card>
      </motion.div>

      {/*BUTTON INFO*/}
      <span className={'fixed bottom-2.5 left-2.5 flex items-center gap-3'}>
        <Text fontSize={'md'}>Toggle Menu</Text>
        <Kbd backgroundColor={'black'}>Alt</Kbd> + <Kbd backgroundColor={'black'}>X</Kbd>
      </span>
    </Box>
  )
}

export default Main
