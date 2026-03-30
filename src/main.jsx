import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { Toaster } from 'react-hot-toast'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 3000,
        style: {
          background: 'rgba(30,18,0,0.95)',
          color: '#fff',
          border: '1px solid rgba(245,166,35,0.3)',
          borderRadius: '16px',
          fontSize: '14px',
          fontWeight: 600,
          backdropFilter: 'blur(16px)',
          padding: '14px 18px',
        },
        success: {
          iconTheme: { primary: '#27ae60', secondary: '#fff' },
        },
        error: {
          iconTheme: { primary: '#e74c3c', secondary: '#fff' },
        },
      }}
    />
  </React.StrictMode>
)