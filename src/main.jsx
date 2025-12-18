import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ServerDataProvider } from './context/ServerDataContext'

createRoot(document.getElementById('root')).render(
  <ServerDataProvider>
    <App />
  </ServerDataProvider>
  ,
)
