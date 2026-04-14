import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { MarketplaceDemoProvider } from './context/MarketplaceDemoContext.jsx'
import { VendorCatalogProvider } from './context/VendorCatalogContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <MarketplaceDemoProvider>
        <VendorCatalogProvider>
          <App />
        </VendorCatalogProvider>
      </MarketplaceDemoProvider>
    </BrowserRouter>
  </StrictMode>,
)
