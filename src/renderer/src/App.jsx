import WindowFrame from "./components/WindowFrame";
import Main from "./components/Main";
import { checkAcrylicSupport } from "../../helpers/helpers";


function App() {

  return (
    <div className={`${checkAcrylicSupport() ? '' : 'bg-[#222222]'} w-[300px] h-screen overflow-hidden text-white`}>
      <WindowFrame/>
      <Main/>
    </div>
  )
}

export default App
