import { Client, IMessage, Stomp } from '@stomp/stompjs';
//import SockJS from 'sockjs-client';
import { apiService } from '../api/apiService';

import { WS_URL } from '../../config/apiConfig.private';

// Использовать URL из конфигурационного файла
// const WS_URL = 'ws://localhost:8080/ws';

type Callback = (message: any) => void;

class WebSocketService {
  private client: Client | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimer: number | null = null;
  private onNotificationCallback: Callback | null = null;
  private onMessageReceivedCallback: Callback | null = null;

  connect(onNotification: Callback, onMessageReceived: Callback) {
    // Сохраняем колбэки
    this.onNotificationCallback = onNotification;
    this.onMessageReceivedCallback = onMessageReceived;
    
    // Если уже подключены, не создаем новое соединение
    if (this.client && this.isConnected) return;
    
    // Если уже есть активная попытка подключения, прерываем ее
    if (this.client) {
      this.disconnect();
    }

    const token = apiService.getToken();
    if (!token) {
      console.warn('Нет токена, WebSocket не подключен');
      return;
    }

    // Создаем фабрику WebSocket для поддержки автоматического переподключения
    const socketFactory = () => {
      console.log('[WS] Creating new WebSocket connection');
      return new WebSocket(WS_URL);
    };
    
    // Используем фабрику вместо прямого создания WebSocket
    this.client = Stomp.over(socketFactory);
    
    // Настраиваем клиент
    this.client.connectHeaders = {
      Authorization: `Bearer ${token}`,
    };
    
    // Дополнительные настройки для стабильного соединения
    this.client.reconnectDelay = 5000; // Задержка переподключения (5 секунд)
    this.client.heartbeatIncoming = 10000; // Регулярные пинги от сервера (10 секунд)
    this.client.heartbeatOutgoing = 10000; // Регулярные пинги на сервер (10 секунд)

    this.client.onConnect = () => {
      this.isConnected = true;
      this.reconnectAttempts = 0; // Сбрасываем счетчик попыток
      console.log('[WS] Connected');

      this.client?.subscribe('/user/queue/notification', (msg: IMessage) => {
        if (this.onNotificationCallback) {
          console.log('[WS] Received notification');
          this.onNotificationCallback(JSON.parse(msg.body));
        }
      });

      this.client?.subscribe('/user/queue/received', (msg: IMessage) => {
        if (this.onMessageReceivedCallback) {
          console.log('[WS] Received message');
          this.onMessageReceivedCallback(JSON.parse(msg.body));
        }
      });
    };

    this.client.onStompError = (frame) => {
      console.error('[WS] Ошибка STOMP', frame.headers['message'], frame.body);
    };

    // Обработка ошибок соединения
    this.client.onWebSocketError = (event) => {
      console.error('[WS] WebSocket error:', event);
    };

    this.client.activate();

    this.client.onWebSocketClose = () => {
      console.warn('[WS] Соединение закрыто');
      this.isConnected = false;
      
      // Очищаем предыдущий таймер, если он существует
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
      
      // Проверяем количество попыток переподключения
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        const delay = Math.min(30000, 1000 * Math.pow(2, this.reconnectAttempts)); // Экспоненциальная задержка
        console.log(`[WS] Попытка переподключения ${this.reconnectAttempts}/${this.maxReconnectAttempts} через ${delay/1000} сек`);
        
        this.reconnectTimer = setTimeout(() => {
          if (this.onNotificationCallback && this.onMessageReceivedCallback) {
            this.connect(this.onNotificationCallback, this.onMessageReceivedCallback);
          }
        }, delay);
      } else {
        console.warn('[WS] Достигнуто максимальное количество попыток переподключения');
        this.client = null;
      }
    };
  }

  isconnected() {
    return this.isConnected;
  }

  sendMessage(message: object) {
    if (!this.client || !this.isConnected) {
      console.warn('[WS] WebSocket не подключен');
      return;
    }

    try {
      this.client.publish({
        destination: '/app/send',
        body: JSON.stringify(message),
      });
      console.log('[WS] Message sent successfully');
    } catch (error) {
      console.error('[WS] Error sending message:', error);
    }
  }

  disconnect() {
    // Очищаем таймер переподключения, если он существует
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.client) {
      try {
        this.client.deactivate();
      } catch (e) {
        console.error('[WS] Ошибка при отключении', e);
      }
    }
    
    this.isConnected = false;
    this.client = null;
    this.reconnectAttempts = 0;
  }
}

export const webSocketService = new WebSocketService();