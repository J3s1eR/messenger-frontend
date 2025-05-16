import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { webSocketService } from '../services/ws/WebSocketService';
import { apiService } from '../services/api/apiService';

import { v4 as uuidv4 } from 'uuid';

import { useAuth } from './AuthContext';

import { debounce} from 'lodash';

interface Message {
  //receiverUid: string;
  sender: string;//senderUid
  num: string;//messageNumber
  message: string; // Предполагается, что это Base64-закодированная строка
  groupOu?: string;

  timestamp?: string;

  payload?: string;

  isReaded: boolean;
}

interface MessagesForChatWithContext{
  messages: Message[];
  newMessagesCount: number;
  newMessages: Message[];
}

interface User {
    uid: string;
    name: string;
    isRegistered: boolean;
  }

interface chatsInfo{
  chats: chatInfo[];
}

interface chatInfo {
    isGroup: boolean;
    id: string;
    name: string;
    //lastMessageInfo: {
    //  owner: string,
    //  lastMessage: string // Предполагается, что это Base64-закодированная строка
    //}
    sender: string; // кто отправил последнее сообщение
    lastMessage: string; // Предполагается, что это Base64-закодированная строка
    unread: number;
    avatar: string; //для компонента chatList.tsx (не используется)
    time: Date; // время отправки последнего сообщения
  }

interface MessageContextType {
  messages: Message[];
  MessagesForChatWithContext: MessagesForChatWithContext;
  sendMessage: (receiverUid: string, msg: string) => void;
  notifications: any[];
  fetchChats: () => Promise<chatsInfo | undefined>;
  currentChatsInfo: chatsInfo;

  fetchNewMessagesCountByUserUid: (uid: string | null) => Promise<number>;
  fetchUsers: () => Promise<User[]>;  // добавление метода для получения зарегистрированных пользователей
  fetchGroups: () => Promise<any>;
  fetchMessagesforChat: (uid: string | null, LoadNew: string, Count: number) => Promise<any>;
  fetchNewMessagesforChatOutOfContext: (Count: number) => void;
  markMessagesAsReadByLastReadedMessageNumOutOfContext: (messageNum: string) => void;


  fetchMessagesForGroup: (ou: string | null) => Promise<any>;

  activeChatUid: string | null;  // Добавлено состояние для активного чата
  setActiveChatUid: (uid: string | null) => void;  // Функция для обновления активного чата
  users: User[];//список пользователей
  ActiveChatUser: User | null;//собеседник
  isLoading: boolean; // Состояние загрузки
}

const ChatMessageContext = createContext<MessageContextType | undefined>(undefined);

export const ChatMessageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {getMyUid, setMyName, getMyName} = useAuth();
  const { user } = useAuth();

  const [currentChatsInfo, setCurrentChatsInfo] = useState<chatsInfo>({chats: []});

  const [messages, setMessages] = useState<Message[]>([]);
  const [MessagesForChatWithContext, setMessagesForChatWithContext] = useState<MessagesForChatWithContext>({
    messages: [],
    newMessagesCount: 0,
    newMessages: [],
  });
  const [notifications, setNotifications] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);  // состояние для пользователей
  const [activeChatUid, setActiveChatUid] = useState<string | null>(null);  // Состояние для активного чата
  const [ActiveChatUser, setActiveChatUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false); // Новое состояние для отслеживания загрузки

  // Создаем ref для хранения текущего activeChatUid, чтобы не перезапускать WebSocket при его изменении
  const activeChatUidRef = useRef<string | null>(null);
  
  // Объявляем функции сначала, чтобы использовать их в обработчиках (useCallback)

  const fetchChats = async (): Promise<chatsInfo | undefined> => {
    if (!user) return;
    const res = await apiService.get('/message/chats');
    //return res.data;
    //return res.data.content; // Получаем только массив чатов

    const data = res?.data.content;

    if (!Array.isArray(data)) {
      console.error('ChatMessagesContext.tsx:\nfetchChats:\nInvalid data format: Expected an array of chatInfo', data);
      return undefined;
    }
    
    const chats = await Promise.all(
      data.map(async (chat: chatInfo) => {
        const newMessagesCount = await fetchNewMessagesCountByUserUid(chat.id);

        return {
          ...chat,
          //...chat.lastMessageInfo,
          //lastMessage: decodeURIComponent(atob(chat.lastMessageInfo.lastMessage)), // Преобразуем из Base64 в строку 
          lastMessage: decodeURIComponent(atob(chat.lastMessage)), // Преобразуем из Base64 в строку 
          unread: newMessagesCount,
          time: new Date(chat.time), // Преобразуем строку времени в объект Date
          sender: chat.sender === getMyName() ? 'Вы' : chat.sender,//надеюсь имя заменить на uid(id)
        }
      }
    ));
    setCurrentChatsInfo({ chats: chats})// Оборачиваем массив в объект типа chatsInfo
    //console.warn('ChatMessagesContext.tsx:\nfetchChats:\ncurrentChatsInfo:', { chats: chats});
    //return { chats };// Оборачиваем массив в объект типа chatsInfo
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
      
      //мы получили новое количество непрочитанных сообщений, нужно обновить состояние чатов
      // Прямое обновление unread для конкретного чата //обновляем currentChatsInfo
      setCurrentChatsInfo((prevState) => 
      prevState 
      ? { chats: prevState.chats.map((chat) => chat.id === uid ? { ...chat, unread: count } : chat) }
      : prevState);


      setMessagesForChatWithContext(prev => ({
        messages: [...prev.messages],
        newMessagesCount: count,
        newMessages: [...prev.newMessages],
      }));


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
    
    for (let i = 0; i < registeredUsers.length; i++) {
      const user = registeredUsers[i];
        //Временное!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! надеюсь
        if ( user.uid === getMyUid() ) {
          setMyName(user.name);
        };
    }

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
    if (!uid) return [];
    if(Count <= 0) return [];

    console.log(`ChatMessagesContext.tsx: \n fetchMessagesforChat(): \n uid: ${uid} \n LoadNew: ${LoadNew} \n Count: ${Count}\n`);

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
    

    //const existingMessageNums = new Set(
    //  MessagesForChatWithContext.newMessages.map((m) => m.num)
    //);

    //ТЕСТ
    let decodedMessages: Message[] = [];
    if(LoadNew === "new"){
      decodedMessages = data
      .map((message: Message) => ({
        ...message,
        isReaded: false,
        message: message.num + " _new_ " + decodeURIComponent(atob(message.message)), // Преобразуем из Base64 в строку | "new_ " + | message.num + " _new_ " +  
      }))
      .filter((message: Message) => 
        //!existingMessageNums.has(message.num)
        !MessagesForChatWithContext.newMessages.some(existingMessage => existingMessage.num.trim().toLowerCase() === message.num.trim().toLowerCase())//показываем только уникальные сообщения (т.к. при вызове new в бэке теперь сообщения не удаляются автоматически(не переносятся в old), и с каждым вызовом мы получаем все еще непрочитанные сообщения(они будут непрочитанными пока не отобразятся на экране))
        && (message.sender !== getMyUid() //показываем только сообщения собеседника, потому что мои сообщения уже есть в old (при отправке читаем все сообщения собеседника, а моё сообщениеавтоматом будет в old (и в new, пока его не прочитают))
        || (message.sender === getMyUid() && message.sender === uid)));//показываем свои сообщения, если мы в чате "избранное" (uid отправителя сообщений, мой uid, uid чата равны)
      }
    else if(LoadNew === "old"){
      decodedMessages = data
      .map((message: Message) => ({
        ...message,
        isReaded: true,
        message: message.num + " _old_ " + decodeURIComponent(atob(message.message)), // Преобразуем из Base64 в строку | "old_ " + | message.num + " _old_ " + 
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
      setMessagesForChatWithContext(prev => {
        // Создаем Set с номерами уже существующих сообщений
        const existingMessageNums = new Set(prev.newMessages.map((m) => m.num.trim().toLowerCase()));

        return{
          messages: [...prev.messages],
          newMessagesCount: count,
          newMessages: [
            ...prev.newMessages, 
            ...decodedMessages.filter(
              (message) => !existingMessageNums.has(message.num.trim().toLowerCase())
            )
          ],
        };
      });
    }
    else if(LoadNew === "old"){
      setMessages(decodedMessages);
      
      setMessagesForChatWithContext(prev =>({
        messages: decodedMessages,
        newMessagesCount: count,
        newMessages: [...prev.newMessages]
      }));
    }
  };

  const markMessagesAsReadByLastReadedMessageNum = async (uid: string | null, messageNum: string) => {
    if (!user || !webSocketService.isconnected()) return;
    if(!uid || !messageNum) return;

    try {
      await apiService.post(`/message/user/${uid}/new/${messageNum}`, {});// {} - empty data в post запросе
      console.log(`ChatMessagesContext:\n markMessagesAsReadByLastReadedMessageNum():\nMarked messages as read: uid=${uid},\n messageNum=\t${messageNum} \n Message: \t${MessagesForChatWithContext.newMessages.find(m => m.num === messageNum)?.message} \n`);


      //переносим сообщение из новых сообщений в прочитанные
      //setMessagesForChatWithContext(prev =>({
      //  messages: [...prev.messages, ...prev.newMessages.filter(m => m.num === messageNum)],
      //  newMessagesCount: prev.newMessagesCount,
      //  newMessages: [...prev.newMessages.filter(m => m.num !== messageNum)]
      //}));
      // и все сообщения до этого (срез массива)
      setMessagesForChatWithContext((prev) => {
        // Находим индекс сообщения с указанным номером
        const index = prev.newMessages.findIndex((m) => m.num === messageNum);

        if (index === -1) {
          // Если сообщение не найдено, возвращаем предыдущее состояние
          console.error('Message not found:', messageNum);
          return prev;
        }

        // Берем все сообщения от начала массива до найденного индекса (включительно)
        const messagesToMove = prev.newMessages.slice(0, index + 1);

        return{
          // Добавляем перенесенные сообщения в messages
          messages: [...prev.messages, ...messagesToMove],
          // Уменьшаем счетчик новых сообщений на количество перенесенных сообщений
          newMessagesCount: Math.max(prev.newMessagesCount - messagesToMove.length, 0),
          // Удаляем перенесенные сообщения из newMessages
          newMessages: prev.newMessages.slice(index + 1),
        };
      });


    } catch (error: any) {
      if (error.response?.status === 400 && error.response.data.message === "Message with given number not found") {
        console.log(`ChatMessagesContext:\n markMessagesAsReadByLastReadedMessageNum() \n Ошибка при попытке пометить сообщение прочитанным: \n Сообщение уже прочитано, либо не найдено\n messageNum=\t${messageNum}\n Message: \t${MessagesForChatWithContext.newMessages.find(m => m.num === messageNum)?.message} \n`);
        } else {
          console.error('Error marking messages as read:', error);
        }
    }

    

    fetchNewMessagesCountByUserUid(uid);//обновляем количество непрочитанных сообщений для чата
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
      isReaded: false,
      //groupOu?: string;
    }
    console.log("messageToShow:\n", messageToShow);
    webSocketService.sendMessage(messageToSend);

    fetchChats();//обновляем currentChatsInfo
    //const count = await fetchNewMessagesCountByUserUid(receiverUid);//можно заменить на считывание из currentchatsInfo для конкретного чата (TO-DO)
    const count = currentChatsInfo.chats.find(chat => chat.id === receiverUid)?.unread || -1;


    if (count > 0){
      await fetchMessagesforChat(activeChatUid, "new", count);//подгружаем все новые сообщения
      console.warn(`sendMessage`);
    }

    if(receiverUid !== getMyUid()){//если не отправляем сообщение себе (в избранное)
      setMessages((prev) => [...prev, messageToShow]); // оптимистичное обновление
        setMessagesForChatWithContext(prev => ({
          messages: [...prev.messages, messageToShow],
          //newMessagesCount: prev.newMessagesCount
          newMessagesCount: 0,//после отправки сообщения, прочитаются все непрочитанные
          newMessages: [...prev.newMessages]
        }));
    }
  };

  const debouncedFetchMessagesforChat = useRef(
    debounce((uid: string | null, LoadNew: string = "old", Count: number = 100) => {
      fetchMessagesforChat(uid, LoadNew, Count); // <-- вызывается, но с задержкой
    }, 1000)
  ).current;

  const fetchNewMessagesforChatOutOfContext  = async (Count: number = 1) => {
    fetchMessagesforChat(activeChatUidRef.current, "new", Count);

  };

  const markMessagesAsReadByLastReadedMessageNumOutOfContext = async (messageNum: string) => {
    if (!user || !webSocketService.isconnected() || !messageNum) return;
    markMessagesAsReadByLastReadedMessageNum(activeChatUidRef.current, messageNum);
  };


  // Создаем обработчики, которые используют activeChatUidRef вместо значения из замыкания
  const handleNotification = useCallback((notif: any) => {//когда приходит сообщение от кого-то
    console.log("NEW NOTIFICATION\nnotif:\n", notif);
    console.log("Current activeChatUid in notification handler:", activeChatUidRef.current);
    
    setNotifications((prev) => [...prev, notif]);
    fetchChats();//обновляем currentChatsInfo
    
    // Используем ref вместо переменной из замыкания
    if (activeChatUidRef.current && notif.sender === activeChatUidRef.current) {
      console.log(`Fetching messages for active chat ${activeChatUidRef.current}`);
      fetchMessagesforChat(activeChatUidRef.current, "new", (currentChatsInfo.chats.find(chat => chat.id === notif.sender)?.unread || 100) + 2 ); // +2 на всякий случай
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
        newMessagesCount: 0,
        newMessages: []
      })
      setIsLoading(true); // устанавливаем состояние загрузки
      
      fetchNewMessagesCountByUserUid(activeChatUid).then((count) => {

        Promise.all([
          fetchUserInfoByUid(activeChatUid),
          //fetchMessagesforChat(activeChatUid),
          fetchMessagesforChat(activeChatUid, "old", 100),//чтобы 2 вызов одной и той же debounce функции не перезаписывал первый вызов, используется обычная функция 
          count > 0 ? debouncedFetchMessagesforChat(activeChatUid, "new", count) : null,
          //fetchMessagesforChat(activeChatUid, "new", 1),
        ].filter(Boolean)) // Убираем null из массива
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
      });

    } else {//если нет активного чата
      setMessages([]); // очистка старых сообщений
      setMessagesForChatWithContext({
        messages: [],
        newMessagesCount: 0,
        newMessages: []
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
        currentChatsInfo,
        fetchChats, 
        fetchNewMessagesCountByUserUid,
        fetchUsers, 
        fetchGroups, 
        fetchMessagesforChat, 
        markMessagesAsReadByLastReadedMessageNumOutOfContext,
        fetchNewMessagesforChatOutOfContext, 
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
