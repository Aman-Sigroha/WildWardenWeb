import { createRoot } from 'react-dom/client'
import './index.css'
import 'leaflet/dist/leaflet.css'
import App from './App.jsx'
import { ThemeProvider } from './contexts/ThemeContext'

// Get the root element
const rootElement = document.getElementById('root')

// Create a root
const root = createRoot(rootElement)

// Render the app
root.render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
)
