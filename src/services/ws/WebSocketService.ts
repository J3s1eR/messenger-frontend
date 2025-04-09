import { Client, IMessage, Stomp } from '@stomp/stompjs';
//import SockJS from 'sockjs-client';
import { apiService } from '../api/apiService';

type Callback = (message: any) => void;

class WebSocketService {
  private client: Client | null = null;
  private isConnected = false;

  connect(onNotification: Callback, onMessageReceived: Callback) {
    if (this.client || this.isConnected) return;

    const token = apiService.getToken();
    if (!token) {
      console.warn('Нет токена, WebSocket не подключен');
      return;
    }

    ***REMOVED***
    this.client = Stomp.over(socket);
    this.client.connectHeaders = {
      Authorization: `Bearer ${token}`,
    };

    this.client.onConnect = () => {
      this.isConnected = true;
      console.log('[WS] Connected');

      // Сохраняем информацию о подключении
      //localStorage.setItem('websocket-connected', 'true');

      this.client?.subscribe('/queue/notification', (msg: IMessage) => {
        onNotification(JSON.parse(msg.body));
      });

      this.client?.subscribe('/queue/recieved', (msg: IMessage) => {
        onMessageReceived(JSON.parse(msg.body));
      });
    };

    this.client.onStompError = (frame) => {
      console.error('[WS] Ошибка STOMP', frame.headers['message'], frame.body);
    };

    this.client.activate();

    this.client.onWebSocketClose = () => {
        console.warn('[WS] Соединение закрыто, повторная попытка через 10 сек');
        this.isConnected = false;
        this.client = null;
        //localStorage.removeItem('websocket-connected');
        setTimeout(() => this.connect(onNotification, onMessageReceived), 10000);
      };
  }

  reconnectIfNeeded() {
    if (localStorage.getItem('websocket-connected') === 'true' && apiService.getMyUid()) {
      // Пытаемся снова подключиться
      this.connect(() => {}, () => {});
    }
  }

  isconnected(){return this.isConnected}

  sendMessage(message: object) {
    if (!this.client || !this.isConnected) {
      console.warn('[WS] WebSocket не подключен');
      return;
    }

    this.client.publish({
      destination: '/app/send',
      body: JSON.stringify(message),
    });
  }

  disconnect() {
    this.client?.deactivate();
    this.isConnected = false;
    this.client = null;
    //localStorage.removeItem('websocket-connected');
  }
}

export const webSocketService = new WebSocketService();
