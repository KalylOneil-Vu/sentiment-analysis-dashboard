import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { VLMProvider } from './context/VLMContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <VLMProvider>
      <App />
    </VLMProvider>
  </React.StrictMode>,
)
