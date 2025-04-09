import { useEffect, useRef } from 'react';
import { MessageBubble } from '../MessageBubble/MessageBubble';
import styles from './MessageList.module.css';

import { CustomScrollbar } from '../CustomScrollbar/CustomScrollbar';

import { useChatMessages } from '../../contexts/ChatMessagesContext';
import { useAuth } from '../../contexts/AuthContext';

/*
const messages = [
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
  },
];
*/

/*
type Message = {
  id: number;
  text: string;
  isOwn: boolean;
  attachments?: string[];
  timestamp: string;
};

type MessageListProps = {
  messages: Message[];
};*/



//export const MessageList = ({ messages }: MessageListProps) => {
export const MessageList = () => {
  const {messages} = useChatMessages();
  const {getMyUid} = useAuth();

  const messagesEndRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    

    <CustomScrollbar className={styles.messageListAllWindow}>
      <div className={styles.messageList}>
      
      {messages.length === 0 && <div className={styles.EmptyChatList}>Сообщений нет</div>}
    
      {messages.map(message => (
        <MessageBubble 
          /*key={message.id}
          text={message.text}
          isOwn={message.isOwn}
          attachments={message.attachments}*/
          key={message.num}
          text={message.message}
          isOwn={message.sender === getMyUid() ? true : false}
          //attachments={message.attachments} //пока нет поддержки
        />
      ))}
      
      <div ref={messagesEndRef} />
      
    
    </div>
    </CustomScrollbar>

    
  );
};