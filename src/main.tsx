
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from '../App'
import './index.css'

// Performance optimization: Preload critical resources
const preloadCriticalResources = () => {
  // Preload critical fonts if needed
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'font';
  link.href = '/fonts/inter-var.woff2'; // Adjust path as needed
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
};

// Initialize performance optimizations
preloadCriticalResources();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
