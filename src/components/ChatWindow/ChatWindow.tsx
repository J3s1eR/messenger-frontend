import { useRef, useState, useEffect } from 'react';

import { ChatHeader } from '../ChatHeader/ChatHeader';
import { MessageList } from '../MessageList/MessageList';
import MessageInput from '../MessageInput/MessageInput';
import styles from './ChatWindow.module.css';

import { useChatMessages } from '../../contexts/ChatMessagesContext';

/*
interface ChatWindowProps {
  //chatId: number;
  //chatUid: string; // uid чата
}
*/

//export const ChatWindow = ({chatUid}:ChatWindowProps) => {
export const ChatWindow = () => {
  /*const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Привет! Как проект?',
      isOwn: false,
      attachments: ['src/assets/image_1.png'],
      timestamp: '10:30'
    },
    {
      id: 2,
      text: 'Все отлично, спасибо!',
      isOwn: true,
      attachments: ['src/assets/image_2.png'],
      timestamp: '10:32'
    },
    // ... другие сообщения
    {
      id: 3,
      text: 'Привет! Как проект?',
      isOwn: false,
      //attachments: ['/image1.jpg'],
      timestamp: '10:30'
    },
    {
      id: 4,
      text: 'Все отлично, спасибо!',
      isOwn: true,
      attachments: ['src/assets/image_1.png'],
      timestamp: '10:32'
    },
    {
      id: 5,
      text: '?',
      isOwn: false,
      //attachments: ['/image1.jpg'],
      timestamp: '10:30'
    },
    {
      id: 6,
      text: '!',
      isOwn: true,
      timestamp: '10:32'
    },
    {
      id: 7,
      text: 'Привет! Как проект?',
      isOwn: false,
      attachments: ['/image1.jpg'],
      timestamp: '10:30'
    },
    {
      id: 8,
      text: 'Все отлично, спасибо!',
      isOwn: true,
      timestamp: '10:32'
    },
    {
      id: 9,
      text: 'Привет! Как проект?',
      isOwn: false,
      attachments: ['/image1.jpg'],
      timestamp: '10:30'
    },
    {
      id: 10,
      text: 'Все отлично, спасибо!',
      isOwn: true,
      timestamp: '10:32'
    },
    {
      id: 11,
      text: 'Привет! Как проект?',
      isOwn: false,
      attachments: ['/image1.jpg'],
      timestamp: '10:30'
    },
    {
      id: 12,
      text: 'Все отлично, спасибо!',
      isOwn: true,
      timestamp: '10:32'
    },
    {
      id: 13,
      text: 'Привет! Как проект?',
      isOwn: false,
      attachments: ['/image1.jpg'],
      timestamp: '10:30'
    },
    {
      id: 14,
      text: 'Все отлично, спасибо!',
      isOwn: true,
      attachments: ['src/assets/photo_2025-03-24_22-23-58.jpg'],
      timestamp: '10:32'
    },
    {
      id: 15,
      text: 'Привет! Как проект?',
      isOwn: false,
      attachments: ['/image1.jpg'],
      timestamp: '10:30'
    },
    {
      id: 16,
      text: 'Все отлично, спасибо!',
      isOwn: true,
      timestamp: '10:32'
    },
    {
      id: 17,
      text: 'Привет! Как проект?',
      isOwn: false,
      attachments: ['/image1.jpg'],
      timestamp: '10:30'
    },
    {
      id: 18,
      text: 'Все отлично, спасибо!',
      isOwn: true,
      timestamp: '10:32'
    },
    {
      id: 19,
      text: 'Привет! Как проект?',
      isOwn: false,
      attachments: ['/image1.jpg'],
      timestamp: '10:30'
    },
    {
      id: 20,
      text: 'Все отлично, спасибо!',
      isOwn: true,
      timestamp: '10:32'
    },
    {
      id: 21,
      text: 'Привет! Как проект?',
      isOwn: false,
      attachments: ['/image1.jpg'],
      timestamp: '10:30'
    },
    {
      id: 22,
      text: 'Все отлично, спасибо!',
      isOwn: true,
      timestamp: '10:32'
    }
    // Здесь можно указать другие начальные сообщения
  ]);
  */

  //const [messages, setMessages] = useState<{ id: number; text: string; isOwn: boolean; attachments?: string[]; timestamp: string }[]>([]);

  const messageInputRef = useRef<HTMLDivElement | null>(null); // Ref для MessageInput
  
  const {activeChatUid, messages, sendMessage, fetchMessagesforChat } = useChatMessages();

  

  //const [chatMessages, setChatMessages] = useState<any[]>([]);
  
  //useEffect(() => {
  //  
  //  /*const loadMessages = async () => {
  //    const fetchedMessages = await fetchMessagesforChat(activeChatUid);
  //    setChatMessages(fetchedMessages); // загружаем сообщения для выбранного чата
  //  };
  //  loadMessages();*/
  //  if(activeChatUid){
  //    fetchMessagesforChat(activeChatUid, "old");
  //  }
  //}, [activeChatUid, fetchMessagesforChat]);
  
  //useEffect(() => {
  //  // Обновляем список сообщений, когда приходят новые через WebSocket, или когда отправляем сообщения
  //  //setChatMessages(messages);
  //  fetchMessagesforChat(activeChatUid, "new");
  //}, [messages, sendMessage]);

  // Функция для добавления нового сообщения
  const addMessage = (text: string) => {
    /*setMessages(prevMessages => [
      ...prevMessages,
      {
        id: prevMessages.length + 1,
        text,
        isOwn: true,
        timestamp: new Date().toLocaleTimeString(),
        attachments: [] // Вы можете добавлять файлы в этом месте, если нужно
      }
    ]);*/

    /*const newMessage = {
      receiverUid: activeChatUid,
      //sender: 'ben',
      //num: '',
      message: text,
      //messageNumber: (chatMessages.length + 1).toString(),
      //senderUid: 'currentUser', // Здесь нужно использовать uid текущего пользователя
      //timestamp: new Date().toLocaleTimeString(), //new Date().toISOString(),
    };*/
    if(!activeChatUid){
      return;
    }
    sendMessage(activeChatUid, text); // отправляем через WebSocket
  };

  return (
    <div className={styles.chatWindow}>
      <ChatHeader />
      {/*<MessageList {/*messages={messages}/>*/}
      {/*<MessageList messages={chatMessages}/>*/}
      <MessageList messageInputRef={messageInputRef}/>
      <MessageInput addMessage={addMessage} ref={messageInputRef}/>
    </div>
  );
};