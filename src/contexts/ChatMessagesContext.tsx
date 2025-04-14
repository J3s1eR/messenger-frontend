import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { webSocketService } from '../services/ws/WebSocketService';
import { apiService } from '../services/api/apiService';

import { v4 as uuidv4 } from 'uuid';

import { useAuth } from './AuthContext';

import { debounce } from 'lodash';

interface Message {
  //receiverUid: string;
  sender: string;//senderUid
  num: string;//messageNumber
  message: string;
  groupOu?: string;

  timestamp?: string;
}

interface User {
    uid: string;
    name: string;
    isRegistered: boolean;
  }

interface MessageContextType {
  messages: Message[];
  sendMessage: (receiverUid: string, msg: string) => void;
  notifications: any[];
  fetchChats: () => Promise<any>;
  fetchUsers: () => Promise<User[]>;  // добавление метода для получения зарегистрированных пользователей
  fetchGroups: () => Promise<any>;
  fetchMessagesforChat: (uid: string | null) => Promise<any>;
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
  const [notifications, setNotifications] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);  // состояние для пользователей
  const [activeChatUid, setActiveChatUid] = useState<string | null>(null);  // Состояние для активного чата
  const [ActiveChatUser, setActiveChatUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false); // Новое состояние для отслеживания загрузки

  useEffect(() => {
    if (!user) return;

    webSocketService.disconnect();
  
    webSocketService.connect(
      (notif) => {
        
        console.log("NEW NOTIFICATION\nnotif:\n", notif)
        setNotifications((prev) => [...prev, notif])
        if (activeChatUid && notif.sender === activeChatUid) {
          fetchMessagesforChat(activeChatUid);
        }
      },
      (msg) => {
        console.log("NEW MESSAGE\nmsg:\n", msg)
        // Декодируем сообщение
        const decodedMsg: Message = {
          sender: msg.sender,
          num: msg.messageNumber,
          message: decodeURIComponent(atob(msg.message)),
          //groupOu: msg.groupOu,
          //timestamp: msg.timestamp,
        };
        
        console.log("NEW MESSAGE\ndecodedMsg:\n", decodedMsg)
        
        // Если это сообщение от активного чата — добавляем в текущие сообщения
        if (activeChatUid && decodedMsg.sender === activeChatUid) {
          setMessages((prev) => [...prev, decodedMsg]);


        } //else {
          // Иначе это сообщение не из активного чата, добавим как уведомление
          //setNotifications((prev) => [...prev, {
          //  sender: decodedMsg.sender,
          //  isGroup: !!decodedMsg.groupOu,
          //  preview: decodedMsg.message,
          //  timestamp: decodedMsg.timestamp,
          //}]);
        //}
      }
    );
    console.log("webSocketService.isconnected():", webSocketService.isconnected())
  
    return () => {
      webSocketService.disconnect();
    };
  }, [user]); // перезапуск соединения при смене юзера

  useEffect(() => {
    if(activeChatUid){
      setMessages([]); // очистка старых сообщений
      setIsLoading(true); // устанавливаем состояние загрузки
      console.log("Чат uid:", activeChatUid);
      
      Promise.all([
        fetchUserInfoByUid(activeChatUid),
        //fetchMessagesforChat(activeChatUid),
        debouncedFetchMessagesforChat(activeChatUid),
      ])
      .then(() => {
        setIsLoading(false); // снимаем состояние загрузки после завершения всех запросов
      })
      .catch((error: any) => {
        if (error.response?.status === 400 && error.response.data.message === "Message already received") {
          console.log('Ошибка при загрузке новых сообщений чата: Сообщение уже получено');
        } else {
          console.error(`Ошибка при загрузке данных чата ${activeChatUid}:`, error);
        }
        setIsLoading(false); // снимаем состояние загрузки в случае ошибки
      });
    }
  }, [activeChatUid]);


  const debouncedFetchMessagesforChat = useRef(
    debounce((uid: string | null) => {
      fetchMessagesforChat(uid); // <-- вызывается, но с задержкой
    }, 1000)
  ).current;
  

  const sendMessage = (receiverUid: string, msg: string) => {
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
    console.log("messageToSend:\n", messageToSend)


    const messageToShow = {
      sender: getMyUid()!.toString(),
      num: messageToSend.messageNumber,
      message: msg,
      //groupOu?: string;
    }
    console.log("messageToShow:\n", messageToShow)
    webSocketService.sendMessage(messageToSend);
    setMessages((prev) => [...prev, messageToShow]); // оптимистичное обновление

  };

  const fetchChats = async () => {
    if (!user) return;
    const res = await apiService.get('/message/chats');
    //return res.data;
    return res.data.content; // Получаем только массив чатов
  };

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

  const fetchMessagesforChat = async (uid: string | null) => {
    if (!user || !webSocketService.isconnected()) return [];
    if (!uid){
      return [];
    }
    //const res_new = await apiService.get(`/message/user/${uid}/new/?page=0&size=100`);
    const res_old = await apiService.get(`/message/user/${uid}/old/?page=0&size=100`);
    //return res.data;
    //setMessages(res.data.content);
    const data = res_old.data.content;
    
    // Преобразуем каждый message из Base64 в строку
    const decodedMessages = data.map((message: { message: string }) => ({
      ...message,
      message: decodeURIComponent(atob(message.message)), // Преобразуем из Base64 в строку
    }));
    setMessages(decodedMessages.reverse());
    //return res.data.content; // Получаем только массив сообщений

  };// Задержка в 1000ms

  const fetchMessagesForGroup = async (ou: string | null) => {
    if (!user || !webSocketService.isconnected()) return [];
    if (!ou){
      return [];
    }
    const res = await apiService.get(`/message/group/${ou}/old/?page=0&size=100`);
    //return res.data;
    return res.data.content; // Получаем только массив сообщений
  };

  return (
    <ChatMessageContext.Provider value={{ 
        messages, 
        sendMessage, 
        notifications, 
        fetchChats, 
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
