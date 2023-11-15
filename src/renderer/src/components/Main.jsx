import { Box, Card, CardBody, CardHeader, Heading, Icon, Kbd, Stack, StackDivider, Text } from "@chakra-ui/react";
import React from "react";
import { IoLogoWindows } from "react-icons/io";
import {FaMemory} from 'react-icons/fa'
import {BsFillCpuFill, BsGpuCard} from 'react-icons/bs'

const {ipcRenderer} = require('electron')
function Main() {
  return (
    <div className={'w-full h-full pl-2 pr-2 pt-5'}>

      <Card backgroundColor={'#d3cdcd'}>
        <CardHeader>
          <Heading size='md'>System Information</Heading>
        </CardHeader>

        <CardBody>
          <Stack divider={<StackDivider borderColor={'black'}/>} spacing='4'>
            <Box className={'flex flex-col gap-2'}>
              <Heading size='xs' textTransform='uppercase'>
                OS:
              </Heading>
              <Box className={'flex items-center gap-4'}>
                <Icon color={'black'} boxSize={6} as={IoLogoWindows}/>
                <Text className={'user-select'}  fontSize='sm'>
                  Windows 10
                </Text>
              </Box>
            </Box>
            <Box className={'flex flex-col gap-2'}>
              <Heading size='xs' textTransform='uppercase'>
                CPU
              </Heading>
              <Box className={'flex items-center gap-4'}>
                <Icon color={'black'} boxSize={6} as={FaMemory}/>
                <Text className={'user-select'} pt='2' fontSize='sm'>
                  Intel i7 3770K
                </Text>
              </Box>
            </Box>

            <Box className={'flex flex-col gap-2'}>

                <Heading size='xs' textTransform='uppercase'>
                  RAM
                </Heading>
              <Box className={'flex items-center gap-4'}>
                <Icon color={'black'} boxSize={6} as={BsFillCpuFill}/>
                <Text className={'user-select'} pt='2' fontSize='sm'>
                  16GB
                </Text>
              </Box>
            </Box>
            <Box className={'flex flex-col gap-2'}>
              <Heading size='xs' textTransform='uppercase'>
                GPU
              </Heading>
              <Box className={'flex items-center gap-4'}>
                <Icon color={'black'} boxSize={6} as={BsGpuCard}/>
                <Text className={'user-select'} pt='2' fontSize='sm'>
                  Nvidia Geforce GTX 950 2gb 256bit
                </Text>
              </Box>
            </Box>
          </Stack>
        </CardBody>
      </Card>

      {/*BUTTON INFO*/}
      <span className={'fixed bottom-2.5 left-2.5 flex items-center gap-3'}>
        <Text fontSize={'md'}>Toggle Menu</Text>
        <Kbd backgroundColor={'black'}>Alt</Kbd> + <Kbd backgroundColor={'black'}>X</Kbd>
      </span>
    </div>
  );
}

export default Main;
