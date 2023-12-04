import WindowFrame from "./components/WindowFrame";
import Main from "./components/Main";
import { checkAcrylicSupport } from "../../helpers/helpers";
import React, { useEffect, useLayoutEffect, useRef } from "react";
import { Kbd, Text } from "@chakra-ui/react";

const { ipcRenderer } = require('electron')

function App() {
  const containerRef = useRef();

  useLayoutEffect(() => {
    ipcRenderer.on("main.set-height", (event, height)=>{
      containerRef.current.style.minHeight = height + 'px'
       })
  }, []);


  return (
    <div ref={containerRef} className={`${checkAcrylicSupport() ? `` : 'bg-[#222222]'} flex flex-col relative w-[300px] min-h-screen overflow-hidden text-white `}>
      <WindowFrame/>
      <Main/>
      {/*BUTTON INFO*/}
      <span className={'flex items-center gap-3 mt-auto pl-2 pb-1'}>
        <Text fontSize={'md'}>Toggle Menu</Text>
        <Kbd backgroundColor={'black'}>Alt</Kbd> + <Kbd backgroundColor={'black'}>X</Kbd>
      </span>
    </div>
  )
}

export default App
