import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import './assets/index.css'
import App from './App'

const theme = extendTheme({
  fonts: {
    body: "Roboto, sans-serif",
  }
});



ReactDOM.createRoot(document.getElementById('root')).render(
  //<React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  //</React.StrictMode>
)
