import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeAndProjectProvider } from './context/ThemeAndProjectContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeAndProjectProvider>
      <App />
    </ThemeAndProjectProvider>
  </React.StrictMode>
);
