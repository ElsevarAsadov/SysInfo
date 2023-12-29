import WindowFrame from "./components/WindowFrame";
import Main from "./components/Main";
import { checkAcrylicSupport } from "../../helpers/functions";
import React, {  useLayoutEffect, useRef } from "react";
import { Stack } from "@chakra-ui/react";
import ButtonInfo from "./components/ButtonInfo";

const { ipcRenderer } = require('electron')

function App() {
  const containerRef = useRef();

  useLayoutEffect(() => {
    ipcRenderer.on("main.set-height", (event, height)=>{
      containerRef.current.style.minHeight = height + 'px'
       })
  }, []);


  return (
    <Stack height={'100vh'} maxHeight={'100vh'} >

      <WindowFrame/>

    <Stack
      ref={containerRef}
      backgroundColor={checkAcrylicSupport() ? `transparent` : 'bg-[#222222]'}
      flex={1}
      position={'relative'}
      width={'300px'}
      overflowY={'scroll'}
      color={'text'}
      >

      <Main/>


    </Stack>

      <ButtonInfo/>

    </Stack>
  )
}

export default App
