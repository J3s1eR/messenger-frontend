//Доп. возможность установки окружения (по умолчанию используется pnpm run dev или pnpm run preview, или (- NODE_ENV=development или - NODE_ENV=production из docker-compose.yml))
// Установка окружения перед импортами
//window.__ENV__ = 'development'; // измените на 'production' при необходимости

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
