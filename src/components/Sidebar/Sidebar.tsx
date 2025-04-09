import { useState, useEffect } from 'react';

import  UserAvatar  from '../UserAvatar/UserAvatar';
import  FolderList  from '../FolderList/FolderList';
import { ChatList } from '../ChatList/ChatList';
import { Squircle } from '../ultimate-squircle/squircle-js';

import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from 'react-router-dom';

import { useChatMessages } from '../../contexts/ChatMessagesContext'; // Импортируем useMessages
import { webSocketService } from '../../services/ws/WebSocketService';

import styles from './Sidebar.module.css';

/*
interface SidebarProps {
  //activeChatId: number | null;
  //setActiveChatId: (id: number | null) => void;

  //activeChatUid: string | null;// uid чата
  //setActiveChatUid: (uid: string | null) => void;
}
*/

//export const Sidebar = ({ activeChatUid, setActiveChatUid }: SidebarProps) => {
export const Sidebar = () => {
  const [isOverlayVisible, setOverlayVisible] = useState(false);

  const { logout } = useAuth();
  const navigate = useNavigate();

  

  const toggleOverlay = () => {
    setOverlayVisible((prev) => !prev);
  };

  // Обработчик для выхода
  const handleLogout = () => {
    // Логика выхода из системы
    console.log('Выход из системы');
    // Здесь можно, например, вызывать логику аутентификации для выхода
    setOverlayVisible(false); // Закрыть оверлей после выхода
    webSocketService.disconnect();
    logout();
    navigate('/login'); // Перенаправление на страницу входа
  };

  // Обработчик для настроек
  const handleSettings = () => {
    // Логика для перехода в настройки
    console.log('Настройки');
    // Здесь можно, например, открыть страницу с настройками
    setOverlayVisible(false); // Закрыть оверлей после перехода в настройки
  };

  return (
    <div className={styles.all_sidebar}>
      <div className={styles.avatar_folders}>
        <div className={styles.avatar} onClick={toggleOverlay}>
          <UserAvatar 
            src = 'src/assets/avatar.png' 
            alt = 'User' 
            defaultWidth = {64} 
            defaultHeight = {64} 
            cornerRadius = {20} 
            cornerSmoothing = {1}/>
        </div>
        <div className={styles.folders}>
          <FolderList />
        </div>
        </div>
      <div className={styles.message_list}>
        {/* Передаем setActiveChatId в ChatList */}
        {/*<ChatList activeChatUid={activeChatUid} setActiveChatUid={setActiveChatUid} chats={chats}/>*/}
        <ChatList/>
      </div>

      {/* Оверлей */}
      {isOverlayVisible && (
        <div className={styles.overlay} onClick={toggleOverlay}>
          {/*<div className={styles.overlayContent} onClick={(e) => e.stopPropagation()}>
            <p>Меню пользователя</p>
            <button onClick={toggleOverlay}>Закрыть</button>
          </div>*/}
          <Squircle 
            className={styles.overlayContent} 

            //style={avatarStyle}
            cornerRadius={20}
            cornerSmoothing={1}

            defaultWidth={140}
            defaultHeight={128}
            onClick={(e) => e.stopPropagation()} // Останавливаем всплытие события, чтобы не закрыть оверлей при клике внутри

            //asChild
        
          >
            <h3 className={styles.MenuItem}>Меню</h3>
            <p className={styles.MenuItem} onClick={handleLogout}>Выйти</p> {/* Обработчик для "Выйти" */}
            <p className={styles.MenuItem} onClick={handleSettings}>Настройки</p> {/* Обработчик для "Настройки" */}
            <p className={styles.MenuItem} onClick={toggleOverlay}>Закрыть</p> {/* Переключение оверлея */}
        
          </Squircle>

        </div>
      )}

      

    </div>
  );
};