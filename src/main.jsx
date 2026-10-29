import React from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.jsx';
import './styles/base.css';
import './styles/layout.css';
import './styles/home.css';
import './styles/calculator.css';
import './styles/gst.css';
import './styles/scientific.css';

registerSW({ immediate: true });

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
