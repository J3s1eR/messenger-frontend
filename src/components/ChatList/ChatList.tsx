import { Squircle } from '../ultimate-squircle/squircle-js';
import styles from './ChatList.module.css';
import  UserAvatar  from '../UserAvatar/UserAvatar';
import { useState, useEffect, useMemo, useRef} from 'react';

import { CustomScrollbar } from '../CustomScrollbar/CustomScrollbar';

import { useChatMessages } from '../../contexts/ChatMessagesContext'; // Импортируем useMessages

import { useAuth } from '../../contexts/AuthContext';

import { FormatDateAndTime } from '../../services/BasicServices/FormatDateAndTime';


//export const ChatList = ({activeChatUid, setActiveChatUid, chats}: ChatListProps) => {
export const ChatList = () => {
  const {activeChatUid, setActiveChatUid} = useChatMessages();
  const {getMyUid} = useAuth();

  const {currentChatsInfo, fetchChats, users, fetchUsers, notifications, isLoading, fetchNewMessagesCountByUserUid} = useChatMessages();
  //const [chats, setChats] = useState<any[]>([]);

  // Мемоизация текущих чатов
  const memoizedChats = useMemo(() => currentChatsInfo.chats, [currentChatsInfo]);

  const [timeIsHovered, setTimeIsHovered] = useState(false);

  const ChatItemRef = useRef<HTMLDivElement>(null);
  const [ChatItemSize, setChatItemSize] = useState({ width: 400, height: 0 });

  const [NewDialogChatsIsOpened, setNewDialogChatsIsOpened] = useState(false);

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      if (entry) {
        const { width, height } = entry.contentRect;
        
        setChatItemSize({ width, height });
      }
    });

    if (ChatItemRef.current) {
      observer.observe(ChatItemRef.current);
    }

    return () => {
      if (ChatItemRef.current) observer.unobserve(ChatItemRef.current);
    };
  }, []);

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

 

  const toggleChat = (chatUid: string) => {
    console.log('toggleChat():\nCurrent activeChatUid:', activeChatUid);
    console.log('toggleChat():\nIncoming chatUid:', chatUid);
    const newUid = activeChatUid === chatUid ? null : chatUid;
    console.log('toggleChat():\nNew chatUid:', newUid);
    
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

        //defaultWidth={400} //ширина терерь регулируется кодом сверху
        defaultHeight={52}
        cornerSmoothing = {1}
        style={{
          minHeight: '52px',
          maxHeight: '52px',
          minWidth: '350px',
          maxWidth: '800px',
          width: `${ChatItemSize.width}px`,
          height: `52px`,
        }}
        onClick={() => {
          fetchUsers();
          setNewDialogChatsIsOpened((prev) => !prev);
        }}//открываем список пользователей для создания нового диалога
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
      <div 
        className={`${NewDialogChatsIsOpened ? styles.NewchatWithUserItemContainerOpened : styles.NewchatWithUserItemContainerClosed}`} 
        style={{
          minHeight: '52px',
          minWidth: '350px',
          maxWidth: '800px',
          width: `${ChatItemSize.width}px`,
        }}
      >
        {users.map(user =>
          <Squircle
          className={`${styles.NewchatWithUserItem}`} 
          cornerRadius={14}
          cornerSmoothing = {1}

          //defaultWidth={400} //ширина терерь регулируется кодом сверху
          defaultHeight={52}

          key={user.uid}
          onClick={() => {
            //toggleChat(chat.id); 
            console.log(`--------------------------------`)
            console.log('chatList.tsx:\nCurrent activeChatUid:', activeChatUid);
            console.log(`chatList.tsx:\nClick chat ${user.uid}`)
            toggleChat(user.uid);
            console.log('chatList.tsx:\nNow activeChatUid:', activeChatUid);
            setNewDialogChatsIsOpened(false);//закрываем список пользователей для создания нового диалога
            //setActiveChatId(chat.id)
          }}
          style={{
            minHeight: '52px',
            maxHeight: '52px',
            minWidth: '350px',
            maxWidth: '800px',
            width: `${ChatItemSize.width}px`,
            height: `52px`,
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
      </div>

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
          
          //defaultWidth={400} //ширина терерь регулируется кодом сверху
          defaultHeight={96}

          onClick={() => {
            //toggleChat(chat.id); 
            console.log(`--------------------------------`)
            console.log('chatList.tsx:\nCurrent activeChatUid:', activeChatUid);
            console.log(`chatList.tsx:\nClick chat ${chat.id}`)
            toggleChat(chat.id);
            console.log('chatList.tsx:\nNow activeChatUid:', activeChatUid);
            setNewDialogChatsIsOpened(false);//закрываем список пользователей для создания нового диалога
            //setActiveChatId(chat.id)
          }}
          style={{
          minHeight: '96px',
          maxHeight: '96px',
          minWidth: '350px',
          maxWidth: '800px',
          width: `${ChatItemSize.width}px`,
          height: `96px`,
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