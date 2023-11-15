import { FaRegWindowMinimize} from "react-icons/fa"
import { AiOutlineClose } from "react-icons/ai";
import React from "react";
import { Tooltip, Text } from "@chakra-ui/react";
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
    <div className={'no-user-select w-screen h-[30px] flex justify-between items-center bg-black text-white pl-1 pr-1'}>

      <div>
        <Text fontSize={'xs'} fontWeight={'bold'}>SysInfo</Text>
      </div>

      <div className={'flex items-center justify-between gap-3'}>
        <Tooltip fontSize={'xs'} label="Hide" margin={2} openDelay={500} hasArrow arrowSize={15}>
          <div className={'hover:cursor-pointer'}>
            <BsArrowBarRight onClick={minimize}/>
          </div>
        </Tooltip>

        <Tooltip fontSize={'xs'} label="Close" margin={2} openDelay={500} hasArrow arrowSize={15}>
          <div className={'hover:cursor-pointer'}>
            <AiOutlineClose onClick={destroy}/>
          </div>
        </Tooltip>

      </div>
    </div>
  );
}

export default WindowFrame;
