import { AiOutlineClose } from "react-icons/ai";
import { Tooltip, Text, Flex, Box } from "@chakra-ui/react";
import { BsArrowBarRight } from "react-icons/bs";



const {ipcRenderer} = require("electron")


const minimize = ()=>{
  ipcRenderer.invoke('window.minimize')
}

const destroy = ()=>{
  ipcRenderer.invoke('window.destroy')
}


function WindowFrame() {
  return (
    <Flex
        justifyContent={"space-between"}
        zIndex={40}
        width={'300px'} //TODO
        height={'30px'}
        background={'black'} //TODO
        color={'white'} //TODO
        padding={'0px 4px'}>
      <Box>
        <Text fontSize={'xs'} fontWeight={'bold'}>SysInfo</Text>
      </Box>

      <Flex gap={'10px'} justifyContent={'space-between'}>

        <Tooltip fontSize={'xs'} label="Hide" margin={2} openDelay={500} hasArrow arrowSize={15}>

            <Box _hover={{
              cursor: "pointer"
          }}>

            <BsArrowBarRight onClick={minimize}/>

          </Box>

        </Tooltip>

        <Tooltip fontSize={'xs'} label="Close" margin={2} openDelay={500} hasArrow arrowSize={15}>

            <Box hover={{
                cursor: "pointer"
            }}>

            <AiOutlineClose onClick={destroy}/>

          </Box>

        </Tooltip>

      </Flex>
    </Flex>
  );
}

export default WindowFrame;
