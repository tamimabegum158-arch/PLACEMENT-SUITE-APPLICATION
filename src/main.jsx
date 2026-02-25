import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { PlatformProvider } from './store/PlatformContext'
import { ToastProvider } from './components/Toast'
import './design-system/design-system.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <PlatformProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </PlatformProvider>
    </BrowserRouter>
  </StrictMode>,
)
