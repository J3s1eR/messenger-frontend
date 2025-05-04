import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { webSocketService } from '../services/ws/WebSocketService';
import { apiService } from '../services/api/apiService';

import { v4 as uuidv4 } from 'uuid';

import { useAuth } from './AuthContext';

import { debounce, get } from 'lodash';

interface Message {
  //receiverUid: string;
  sender: string;//senderUid
  num: string;//messageNumber
  message: string;
  groupOu?: string;

  timestamp?: string;

  payload?: string;
}

interface MessagesForChatWithContext{
  messages: Message[];
  newMessagesCount: number;
}

interface User {
    uid: string;
    name: string;
    isRegistered: boolean;
  }

interface MessageContextType {
  messages: Message[];
  MessagesForChatWithContext: MessagesForChatWithContext;
  sendMessage: (receiverUid: string, msg: string) => void;
  notifications: any[];
  fetchChats: () => Promise<any>;
  fetchNewMessagesCountByUserUid: (uid: string | null) => Promise<number>;
  fetchUsers: () => Promise<User[]>;  // добавление метода для получения зарегистрированных пользователей
  fetchGroups: () => Promise<any>;
  fetchMessagesforChat: (uid: string | null, LoadNew: string, Count: number) => Promise<any>;
  fetchMessagesForGroup: (ou: string | null) => Promise<any>;

  activeChatUid: string | null;  // Добавлено состояние для активного чата
  setActiveChatUid: (uid: string | null) => void;  // Функция для обновления активного чата
  users: User[];//список пользователей
  ActiveChatUser: User | null;//собеседник
  isLoading: boolean; // Состояние загрузки
}

const ChatMessageContext = createContext<MessageContextType | undefined>(undefined);

export const ChatMessageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {getMyUid} = useAuth();
  const { user } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [MessagesForChatWithContext, setMessagesForChatWithContext] = useState<MessagesForChatWithContext>({
    messages: [],
    newMessagesCount: 0
  });
  const [notifications, setNotifications] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);  // состояние для пользователей
  const [activeChatUid, setActiveChatUid] = useState<string | null>(null);  // Состояние для активного чата
  const [ActiveChatUser, setActiveChatUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false); // Новое состояние для отслеживания загрузки

  // Создаем ref для хранения текущего activeChatUid, чтобы не перезапускать WebSocket при его изменении
  const activeChatUidRef = useRef<string | null>(null);
  
  // Объявляем функции сначала, чтобы использовать их в обработчиках (useCallback)

  const fetchChats = async () => {
    if (!user) return;
    const res = await apiService.get('/message/chats');
    //return res.data;
    return res.data.content; // Получаем только массив чатов
  };

  const fetchNewMessagesCountByUserUid = async (uid: string | null) => {
    if (!user) return 0; // Возвращаем 0, если нет пользователя
    if (!uid) return 0;  // Возвращаем 0, если нет uid
    
    try {
      console.log(`ChatMessagesContext.tsx:\nFetching new messages count for user ${uid}`);
      const res = await apiService.get(`/message/user/${uid}/new/count`);
      
      // Логируем полный ответ для отладки
      console.log(`ChatMessagesContext.tsx:\nChat:`, uid);
      console.log(`ChatMessagesContext.tsx:\nFull API response for new messages count:`, res);
      console.log(`ChatMessagesContext.tsx:\nResponse data for new messages count:`, res.data);
      console.log(`ChatMessagesContext.tsx:\nResponse data type for new messages count:`, typeof res.data);
      
      // Более детальная проверка типа
      console.log(`ChatMessagesContext.tsx:\nTesting conditions:`, {
        'res.data !== undefined': res.data !== undefined,
        'res.data !== null': res.data !== null,
        'typeof res.data === "number"': typeof res.data === 'number',
        'res.data is valid number': !isNaN(Number(res.data))
      });
      
      // Преобразуем к числу, независимо от исходного типа
      let count: number;
      
      if (res.data && typeof res.data === 'number') {
        count = res.data;
      } else if (res.data && typeof res.data.content === 'number') {
        count = res.data.content;
      } else if (typeof res.data === 'string' && !isNaN(Number(res.data))) {
        count = Number(res.data);
      } else if (res.data && res.data.content && typeof res.data.content !== 'undefined') {
        console.warn(`ChatMessagesContext.tsx:\nInvalid response structure for new messages count:`, res.data);
        return -2; // Если структура ответа не соответствует ожиданиям
      } else {
        count = 0; // Значение по умолчанию
      }
      
      console.log(`ChatMessagesContext.tsx:\nFinal count value:`, count, 'type:', typeof count);
      return count;
      
    } catch (error) {
      console.error(`ChatMessagesContext.tsx:\nError fetching new messages count for user ${uid}:`, error);
      return -1; // В случае ошибки возвращаем -1
    }
  }

  const fetchUsers = async () => {
    if(users.length > 0) return users;//временное решение
    if (!user) return;
    const res = await apiService.get('/user');
    const registeredUsers = res.data.content.filter((user: { isRegistered: boolean }) => user.isRegistered);//список зарегестрированных пользователей
    setUsers(registeredUsers);  // Обновляем состояние пользователей
    return registeredUsers;
  };

  const fetchUserInfoByUid = async (uid: string | null) => {
    if (!user || !webSocketService.isconnected()) return [];
    if(!uid){
      setActiveChatUser(null);
      return [];
    }
    try {
      const res = await apiService.get(`/user/${uid}`);
      const data = res.data;
      setActiveChatUser({// Обновляем состояние Собеседника
        uid: data.uid,
        name: data.name,
        isRegistered: data.isRegistered,
      });
      return data;
    } catch (error) {
      console.error(`Ошибка при получении информации о пользователе ${uid}:`, error);
      setActiveChatUser(null);
      return [];
    }
  };
  
  const fetchGroups = async () => {
    if (!user || !webSocketService.isconnected()) return;
    const res = await apiService.get('/group');
    return res.data;
  };

  const fetchMessagesforChat = async (uid: string | null, LoadNew: string = "old", Count: number = 100) => {
    if (!user || !webSocketService.isconnected()) return [];
    if (!uid){
      return [];
    }
    let res;
    if(LoadNew === "new"){
      res = await apiService.get(`/message/user/${uid}/new/?page=0&size=${Count}`);
    }
    //else if(LoadNew === "new 1"){
    //  res = await apiService.get(`/message/user/${uid}/new/?page=0&size=1`);
    //}
    else if(LoadNew === "old"){
      res = await apiService.get(`/message/user/${uid}/old/?page=0&size=${Count}`);
    }
    //return res.data;
    //setMessages(res.data.content);
    const data = res?.data.content;
    
    // Преобразуем каждый message из Base64 в строку

    //ТЕСТ
    let decodedMessages: Message[] = [];
    if(LoadNew === "new"){
      decodedMessages = data
      .map((message: Message) => ({
        ...message,
        message: "new_ " + decodeURIComponent(atob(message.message)), // Преобразуем из Base64 в строку
      }))
      .filter((message: Message) => message.sender !== getMyUid());//показываем только сообщения собеседника, потому что мои сообщения уже есть в old
      }
    else if(LoadNew === "old"){
      decodedMessages = data
      .map((message: { message: string }) => ({
        ...message,
        message: "old_ " + decodeURIComponent(atob(message.message)), // Преобразуем из Base64 в строку
      }))
      .reverse();
    }
    //const decodedMessages = data.map((message: { message: string }) => ({
    //  ...message,
    //  message: decodeURIComponent(atob(message.message)), // Преобразуем из Base64 в строку
    //}));

   
    const count = await fetchNewMessagesCountByUserUid(uid);

    if(LoadNew === "new"){
      setMessages((prev) => [...prev, ...decodedMessages]);
      setMessagesForChatWithContext(prev => ({
        messages: [...prev.messages, ...decodedMessages],
        newMessagesCount: count
      }));
    }
    //else if(LoadNew === "new 1"){
    //  setMessages((prev) => [...prev, ...decodedMessages.reverse()]);
    //}
    else if(LoadNew === "old"){
      setMessages(decodedMessages);
      
      setMessagesForChatWithContext({
        messages: decodedMessages,
        newMessagesCount: count
      });
    }
  };

  const fetchMessagesForGroup = async (ou: string | null) => {
    if (!user || !webSocketService.isconnected()) return [];
    if (!ou){
      return [];
    }
    const res = await apiService.get(`/message/group/${ou}/old/?page=0&size=100`);
    //return res.data;
    return res.data.content; // Получаем только массив сообщений
  };

  const sendMessage = async (receiverUid: string, msg: string) => {
    if (!user || !webSocketService.isconnected()) return;
    const messageToSend = {
      receiverUid: receiverUid,
      //sender: 'ben',
      messageNumber: uuidv4(),
      message: btoa(encodeURIComponent(msg)),//to base64 //mgs
      //messageNumber: (chatMessages.length + 1).toString(),
      //senderUid: 'currentUser', // Здесь нужно использовать uid текущего пользователя
      //timestamp: new Date().toLocaleTimeString(), //new Date().toISOString(),
    }
    console.log("messageToSend:\n", messageToSend);

    const messageToShow = {
      sender: getMyUid()!.toString(),
      num: messageToSend.messageNumber,
      message: msg,
      //groupOu?: string;
    }
    console.log("messageToShow:\n", messageToShow);
    webSocketService.sendMessage(messageToSend);

    const count = await fetchNewMessagesCountByUserUid(receiverUid);
    if (count > 0){
      await fetchMessagesforChat(activeChatUid, "new", count);//подгружаем все новые сообщения
      console.warn(`sendMessage`);
      setMessages((prev) => [...prev, messageToShow]); // оптимистичное обновление
      setMessagesForChatWithContext(prev => ({
        messages: [...prev.messages, messageToShow],
        //newMessagesCount: prev.newMessagesCount
        newMessagesCount: 0//после отправки сообщения, прочитаются все непрочитанные
      }));
    }
    else if (count === 0){
      setMessages((prev) => [...prev, messageToShow]); // оптимистичное обновление
      setMessagesForChatWithContext(prev => ({
        messages: [...prev.messages, messageToShow],
        //newMessagesCount: prev.newMessagesCount
        newMessagesCount: 0//после отправки сообщения, прочитаются все непрочитанные
      }));
    }
  };

  const debouncedFetchMessagesforChat = useRef(
    debounce((uid: string | null) => {
      fetchMessagesforChat(uid, "old", 100); // <-- вызывается, но с задержкой
    }, 1000)
  ).current;

  // Создаем обработчики, которые используют activeChatUidRef вместо значения из замыкания
  const handleNotification = useCallback((notif: any) => {//когда приходит сообщение от кого-то
    console.log("NEW NOTIFICATION\nnotif:\n", notif);
    console.log("Current activeChatUid in notification handler:", activeChatUidRef.current);
    
    setNotifications((prev) => [...prev, notif]);
    
    // Используем ref вместо переменной из замыкания
    if (activeChatUidRef.current && notif.sender === activeChatUidRef.current) {
      console.log(`Fetching messages for active chat ${activeChatUidRef.current}`);
      fetchMessagesforChat(activeChatUidRef.current, "new");
    } else {
      console.log(`No active chat matching notification sender (active: ${activeChatUidRef.current}, sender: ${notif.sender})`);
    }
  }, []); // Нет зависимостей от activeChatUid (чтобы не перезапускать websocket)

  const handleMessage = useCallback((msg: any) => {//когда отправленное мною сообщение читают
    console.log("NEW MESSAGE SENT\nmsg:\n", msg);
    console.log("Current activeChatUid in message handler:", activeChatUidRef.current);
    
    // Декодируем сообщение
    const MsgNum = {
      //sender: msg.sender,
      num: msg.messageNumber,
      //message: decodeURIComponent(atob(msg.message)),
      //groupOu: msg.groupOu,
      //timestamp: msg.timestamp,
    };
    
    console.log("Received essage num:", MsgNum);
    
    // Используем ref вместо переменной из замыкания
    //if (activeChatUidRef.current && MsgNum.sender === activeChatUidRef.current) {
      //console.log(`Adding message to active chat ${activeChatUidRef.current}`);
      //setMessages((prev) => [...prev, decodedMsg]);
    //} else {
      //console.log(`No active chat matching message sender (active: ${activeChatUidRef.current}, sender: ${decodedMsg.sender})`);
      // Иначе это сообщение не из активного чата, добавим как уведомление
      //setNotifications((prev) => [...prev, {
      //  sender: decodedMsg.sender,
      //  isGroup: !!decodedMsg.groupOu,
      //  preview: decodedMsg.message,
      //  timestamp: decodedMsg.timestamp,
      //}]);
    //}
  }, []); // Нет зависимостей от activeChatUid (чтобы не перезапускать websocket)

  
  useEffect(() => {
    activeChatUidRef.current = activeChatUid;// При изменении activeChatUid обновляем ref
    console.log('ChatMessagesContext:\nactiveChatUid changed to:', activeChatUid);
    
    if(activeChatUid){
      setMessages([]); // очистка старых сообщений
      setMessagesForChatWithContext({
        messages: [],
        newMessagesCount: 0
      })
      setIsLoading(true); // устанавливаем состояние загрузки
      
      Promise.all([
        fetchUserInfoByUid(activeChatUid),
        //fetchMessagesforChat(activeChatUid),
        debouncedFetchMessagesforChat(activeChatUid),
        
        //fetchMessagesforChat(activeChatUid, "new", 1),
      ])
      .then(() => {
        setIsLoading(false); // снимаем состояние загрузки после завершения всех запросов
      })
      .catch((error: any) => {
        if (error.response?.status === 400 && error.response.data.message === "Message already received") {
          console.log('ChatMessagesContext:\nОшибка при загрузке новых сообщений чата: Сообщение уже получено');
        } else {
          console.error(`ChatMessagesContext:\nОшибка при загрузке данных чата ${activeChatUid}:`, error);
        }
        setIsLoading(false); // снимаем состояние загрузки в случае ошибки
      });
    } else {//если нет активного чата
      setMessages([]); // очистка старых сообщений
      setMessagesForChatWithContext({
        messages: [],
        newMessagesCount: 0
      })
      setActiveChatUser(null);
    }
  }, [activeChatUid]);

  // Подключаем WebSocket только при изменении user
  useEffect(() => {
    if (!user) return;
    
    console.log("Setting up WebSocket connection once for user");
    
    // Отключаем предыдущее соединение перед созданием нового
    webSocketService.disconnect();
    
    // Добавляем небольшую задержку перед переподключением
    setTimeout(() => {
      console.log("Connecting to WebSocket after delay");
      webSocketService.connect(handleNotification, handleMessage);
      console.log("webSocketService.isconnected():", webSocketService.isconnected());
    }, 500);
  
    return () => {
      console.log("Disconnecting WebSocket");
      webSocketService.disconnect();
    };
  }, [user, handleNotification, handleMessage]);

  return (
    <ChatMessageContext.Provider value={{ 
        messages, 
        MessagesForChatWithContext,
        sendMessage, 
        notifications, 
        fetchChats, 
        fetchNewMessagesCountByUserUid,
        fetchUsers, 
        fetchGroups, 
        fetchMessagesforChat, 
        fetchMessagesForGroup,

        users,

        activeChatUid,  // Добавление activeChatUid в контекст
        setActiveChatUid,  // Функция для обновления activeChatUid
        ActiveChatUser,
        isLoading, // Добавляем состояние загрузки в контекст
        }}>
      {children}
    </ChatMessageContext.Provider>
  );
};

export const useChatMessages = (): MessageContextType => {
  const context = useContext(ChatMessageContext);
  if (!context) {
    throw new Error('useMessages must be used within a MessageProvider');
  }
  return context;
};
