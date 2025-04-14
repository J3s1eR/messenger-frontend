// API URL для различных окружений - заглушка для коммита
// Перед запуском проекта скопируйте содержимое apiConfig.ts в apiConfig.private.ts и укажите свои значения

const CONFIG = {
  development: {
    API_URL: 'http://localhost:8080', // Заглушка
    WS_URL: 'ws://localhost:8080/ws'  // Заглушка
  },
  production: {
    API_URL: 'http://YOUR_PRODUCTION_API', // Заглушка
    WS_URL: 'ws://YOUR_PRODUCTION_WS' // Заглушка
  },
  test: {
    API_URL: 'http://localhost:8080', // Заглушка
    WS_URL: 'ws://localhost:8080/ws' // Заглушка
  }
};

// Определяем текущее окружение
// Попытка получить переменную окружения. Если она не доступна, используем 'development'
const ENV = typeof window !== 'undefined' && window.__ENV__ 
  ? window.__ENV__ 
  : 'development';

// Экспортируем нужную конфигурацию
export const { API_URL, WS_URL } = CONFIG[ENV as keyof typeof CONFIG];

// Добавляем тип для window
declare global {
  interface Window {
    __ENV__?: string;
  }
} 