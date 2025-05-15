import { Squircle } from '../ultimate-squircle/squircle-js';
import styles from './ChatList.module.css';
import  UserAvatar  from '../UserAvatar/UserAvatar';
import { useState, useEffect, useMemo} from 'react';

import { CustomScrollbar } from '../CustomScrollbar/CustomScrollbar';

import { useChatMessages } from '../../contexts/ChatMessagesContext'; // Импортируем useMessages

import { useAuth } from '../../contexts/AuthContext';

import { FormatDateAndTime } from '../../services/BasicServices/FormatDateAndTime';


/*
const chats = [
  {
    id: 1,
    avatar: 'src/assets/dog.png',
    name: 'Анна Иванова',
    lastMessage: 'Документы готовы',
    time: '10:30',
    unread: 2
  },
  {
    id: 2,
    avatar: 'src/assets/john_pork.png',
    name: 'John Pork',
    lastMessage: 'Встреча перенесена',
    time: 'Вчера',
    unread: 0
  },
  // ... другие чаты
  {
    id: 3,
    avatar: 'src/assets/Ye.png',
    name: 'Ye',
    lastMessage: 'Встреча перенесена',
    time: 'Вчера',
    unread: 3
  },
  {
    id: 4,
    avatar: 'src/assets/dog_2.png',
    name: 'John Pork',
    lastMessage: 'Встреча перенесена',
    time: 'Вчера',
    unread: 0
  },
  {
    id: 5,
    avatar: 'src/assets/iii.png',
    name: 'User Name',
    lastMessage: 'Встреча перенесена',
    time: 'Вчера',
    unread: 0
  },
  {
    id: 6,
    avatar: 'src/assets/john_pork.png',
    name: 'John Pork',
    lastMessage: 'Встреча перенесена',
    time: 'Вчера',
    unread: 0
  },
  {
    id: 7,
    avatar: 'src/assets/Ye.png',
    name: 'John Pork',
    lastMessage: 'Встреча перенесена',
    time: 'Вчера',
    unread: 0
  },
  {
    id: 8,
    avatar: 'src/assets/dog_2.png',
    name: 'John Pork',
    lastMessage: 'Встреча перенесена',
    time: 'Вчера',
    unread: 0
  },
  {
    id: 9,
    avatar: 'src/assets/iii.png',
    name: 'John Pork',
    lastMessage: 'Встреча перенесена',
    time: 'Вчера',
    unread: 0
  },
  {
    id: 10,
    avatar: 'src/assets/dog_2.png',
    name: 'John Pork',
    lastMessage: 'Встреча перенесена',
    time: 'Вчера',
    unread: 0
  },
  {
    id: 11,
    avatar: 'src/assets/Ye.png',
    name: 'John Pork',
    lastMessage: 'Встреча перенесена',
    time: 'Вчера',
    unread: 0
  },
  {
    id: 12,
    avatar: 'src/assets/iii.png',
    name: 'John Pork',
    lastMessage: 'Встреча перенесена',
    time: 'Вчера',
    unread: 0
  },
  {
    id: 13,
    avatar: 'src/assets/john_pork.png',
    name: 'John Pork',
    lastMessage: 'Встреча перенесена',
    time: 'Вчера',
    unread: 0
  },


];
*/

/*
interface ChatListProps {
  //activeChatId: number | null;
  //setActiveChatId: (id: number | null) => void;

  //activeChatUid: string | null;
  //setActiveChatUid: (Uid: string | null) => void;
  //chats: any[]; // список чатов
}
*/

//export const ChatList = ({activeChatUid, setActiveChatUid, chats}: ChatListProps) => {
export const ChatList = () => {
  const {activeChatUid, setActiveChatUid} = useChatMessages();
  const {getMyUid} = useAuth();

  const {currentChatsInfo, fetchChats, users, fetchUsers, notifications, isLoading, fetchNewMessagesCountByUserUid} = useChatMessages();
  //const [chats, setChats] = useState<any[]>([]);

  // Мемоизация текущих чатов
  const memoizedChats = useMemo(() => currentChatsInfo.chats, [currentChatsInfo]);

  const [timeIsHovered, setTimeIsHovered] = useState(false);

  // Добавляем эффект для обновления счетчика непрочитанных сообщений при получении уведомлений
  //useEffect(() => {
  //  if (notifications.length > 0 && chats.length > 0) {
  //    // Получаем последнее уведомление
  //    const lastNotification = notifications[notifications.length - 1];
  //    
  //    // Находим чат, к которому относится уведомление
  //    const chatToUpdate = chats.find(chat => chat.id === lastNotification.sender);
  //    
  //    if (chatToUpdate && lastNotification.sender !== activeChatUid) {
  //      // Увеличиваем счетчик непрочитанных сообщений только если чат не активен
  //      chatToUpdate.unread = (chatToUpdate.unread || 0) + 1;
  //      console.log(`chatList.tsx:\nUpdated unread count for chat ${chatToUpdate.id} to ${chatToUpdate.unread}`);
  //      
  //      // Обновляем список чатов для вызова ререндера
  //      setChats([...chats]);
  //    }
  //  }
  //}, [notifications, chats, activeChatUid]);

  useEffect(() => {
    //const loadChatsAndUsers = async () => {
    //  try {
    //    const fetchedChats = await fetchChats();
    //    if (fetchedChats && Array.isArray(fetchedChats)) {
    //      
    //      // Получаем количество новых сообщений для каждого чата
    //      for (const chat of fetchedChats) {
    //        if (chat && chat.id) {
    //          try {
    //            console.log('chatList.tsx:\nFetching new messages for:', chat.id);
    //            const newMessagesCount = await fetchNewMessagesCountByUserUid(chat.id);
    //            console.log('chatList.tsx:\nChat:', chat.id, '\nNew messages count value:', newMessagesCount, 'type:', typeof newMessagesCount);
    //            chat.unread = Number(newMessagesCount);
    //          } catch (err) {
    //            console.error('chatList.tsx:\nError getting message count for chat', chat.id, err);
    //            chat.unread = 0;
    //          }
    //        }
    //      }
    //      setChats(fetchedChats);//Обновляем список чатов только после получения количества сообщений
    //    } else {
    //      console.warn('fetchChats returned invalid data:', fetchedChats);
    //      setChats([]);
    //    }
    //    
    //    // Загружаем список пользователей
    //    fetchUsers();
    //  } catch (error) {
    //    console.error('Error loading chats and users:', error);
    //  }
    //};
    
    //loadChatsAndUsers();
    fetchChats();
    fetchUsers();
    //console.log('chatList.tsx:\ncurrentChatsInfo:', currentChatsInfo);
  }, []);

  //}, [fetchChats]);currentChatsInfo handleNotification memoizedChats

  /*
  // Состояние для хранения ID открытого чата
  const [openedChatId, setOpenedChatId] = useState<number | null>(null);

  // Функция для переключения состояния открытия/закрытия чата
  const toggleChat = (chatId: number) => {
    setOpenedChatId((prevId) => (prevId === chatId ? null : chatId));
  };*/


  // Функция для переключения состояния открытия/закрытия чата
  /*const toggleChat = (chatId: number) => {
    const newId = activeChatId === chatId ? null : chatId;
    setActiveChatId(newId);
  };*/

  const toggleChat = (chatUid: string) => {
    console.log('toggleChat():\nCurrent activeChatUid:', activeChatUid);
    console.log('toggleChat():\nIncoming chatUid:', chatUid);
    const newUid = activeChatUid === chatUid ? null : chatUid;
    console.log('toggleChat():\nNew chatUid:', newUid);
    
    // Сбрасываем счетчик непрочитанных сообщений только при активации чата
    //if (newUid !== null) {
    //  const chatToUpdate = chats.find(chat => chat.id === chatUid);
    //  if (chatToUpdate) {
    //    chatToUpdate.unread = 0;
    //    console.log(`toggleChat():\nReset unread count for chat ${chatUid}`);
    //    // Обновляем список чатов для вызова ререндера
    //    setChats([...chats]);
    //  }
    //}
    
    setActiveChatUid(newUid);
    console.log('toggleChat():\nNow activeChatUid:', activeChatUid);
  };


  return (
    <CustomScrollbar>
    <div className={styles.chatList}>

    {/*кнопка для создания нового диалога*/} 
    <Squircle
        className={styles.NewchatWithUser} 
        cornerRadius={16}

        defaultWidth={400}
        defaultHeight={52}
        cornerSmoothing = {1}
        >

          
          
          <Squircle
          className={styles.NewchatWithUserIcon}
          defaultWidth = {44} 
          defaultHeight = {44} 
          cornerRadius = {14} 
          cornerSmoothing = {1}>
            +
          </Squircle>
          

          <div className={styles.all_content}>
            {/* Основное содержимое */}
            <div className={styles.content}>
              <div className={styles.name}>
                Новый диалог
              </div>
            
              <div className={styles.message}>
              Выбрать собеседника
              </div>
            </div>
          </div>
        </Squircle>

      {/*список пользователей для создания нового диалога*/}
      {users.map(user =>
        <Squircle
        className={styles.NewchatWithUserItem} 
        cornerRadius={14}
        cornerSmoothing = {1}

        defaultWidth={400}
        defaultHeight={52}

        key={user.uid}
        onClick={() => {
          //toggleChat(chat.id); 
          console.log(`--------------------------------`)
          console.log('chatList.tsx:\nCurrent activeChatUid:', activeChatUid);
          console.log(`chatList.tsx:\nClick chat ${user.uid}`)
          toggleChat(user.uid);
          console.log('chatList.tsx:\nNow activeChatUid:', activeChatUid);
          //setActiveChatId(chat.id)
        }}
        >

          <div className={styles.avatar}>
          <UserAvatar 
            //src = {user.avatar} 
            alt = {user.name} 
            defaultWidth = {44} 
            defaultHeight = {44} 
            cornerRadius = {12} 
            cornerSmoothing = {1}/>
          </div>

          <div className={styles.all_content}>
            {/* Основное содержимое */}
            <div className={styles.content}>
              <div className={styles.name}>
                {isLoading ? 'Загрузка...' : user.uid === getMyUid() ? 'Избранное' : user.name}
              </div>
            
              <div className={styles.message}>
              Написать сообщение
              </div>
            </div>
          </div>
        </Squircle>
      )}

      {/*список существующих чатов*/}
      {Array.isArray(currentChatsInfo?.chats) && currentChatsInfo?.chats.length > 0 ? (
        currentChatsInfo.chats.map(chat => (
          
        <Squircle
        //key={chat.id}
          key={chat.id}
          
          //className={`${styles.chatItem} ${chat.unread > 0 ? styles.unread : ''} ${openedChatId === chat.id ? styles.openedChat : ''}`}
          //className={`${styles.chatItem} ${chat.unread > 0 ? styles.unread : ''} ${activeChatId === chat.id ? styles.openedChat : ''}`}
          className={`${styles.chatItem} ${chat.unread > 0 ? styles.unread : ''} ${activeChatUid === chat.id ? styles.openedChat : ''}`}
          
          //cornerRadius={12}
          
          topLeftCornerRadius={0}//Левый верхний
          topRightCornerRadius={20}//Правый верхний
          bottomLeftCornerRadius={0}//Левый нижний
          bottomRightCornerRadius={20}//Правый нижний
          cornerSmoothing={1}
          
          defaultWidth={400}
          defaultHeight={96}

          onClick={() => {
            //toggleChat(chat.id); 
            console.log(`--------------------------------`)
            console.log('chatList.tsx:\nCurrent activeChatUid:', activeChatUid);
            console.log(`chatList.tsx:\nClick chat ${chat.id}`)
            toggleChat(chat.id);
            console.log('chatList.tsx:\nNow activeChatUid:', activeChatUid);
            //setActiveChatId(chat.id)
          }}
          //onClick={() => toggleChat(chat.id);} // Переключение состояния
          >
          {/* Аватарка */}
          {/*<Squircle
            cornerRadius={20}
            cornerSmoothing={1}
  
            defaultWidth={64}
            defaultHeight={64}
            className={styles.avatar}
            asChild
          >
          <img 
            src={chat.avatar} 
            alt={chat.name} 
            
          />
          </Squircle>*/}

          <div className={styles.avatar}>
          <UserAvatar 
            src = {chat?.avatar} 
            alt = {chat.name} 
            defaultWidth = {64} 
            defaultHeight = {64} 
            cornerRadius = {20} 
            cornerSmoothing = {1}/>
          </div>

          <div className={styles.all_content}>
            {/* Основное содержимое */}
            <div className={styles.content}>
              <div className={styles.name}>
                {isLoading ? 'Загрузка...' : chat.id === getMyUid() ? 'Избранное' : chat.name}
              </div>
            
              <div className={styles.message}>
              {chat.sender}: {chat.lastMessage}
              </div>
            </div>
            
            {/* Дополнительная информация */}
            <div className={styles.second_info}>
              <span 
                className={styles.time}
                onMouseEnter={() => setTimeIsHovered(true)}
                onMouseLeave={() => setTimeIsHovered(false)}
              >
                {timeIsHovered ? FormatDateAndTime.formatDate_FullDate(chat.time)
                : FormatDateAndTime.formatTime_HourAndMinute(chat.time)}
              </span>
              {/*условный рендеринг*/}
              {chat.unread > 0 && (<span className={styles.badge}>{chat.unread}</span>)}
              <span></span>
              <span></span>
            </div>
          </div>
          
          {/* Дополнительное содержимое при открытии (Не используется)*/}
          {/*openedChatId */}
          {/*activeChatId === chat.id && (*/}
          {activeChatUid === chat.id && (
              <div className={styles.openedChat}>
                {/* <p>Это дополнительная информация о чате с {chat.name}.</p>
                <p>Здесь могут быть детали или действия.</p> */}
                
              </div>
            )}

        </Squircle>
      ))
    ) : (<div className={styles.noChats}>Загрузка чатов...</div>)
    }
    </div>
    </CustomScrollbar>
  );
};