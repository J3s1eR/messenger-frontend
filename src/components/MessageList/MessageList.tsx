import { useEffect, useRef, useState } from 'react';
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
  const {messages, isLoading} = useChatMessages();
  const {getMyUid} = useAuth();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [userScrolled, setUserScrolled] = useState(false);
  const prevMessagesLength = useRef(0);

  // Отслеживаем прокрутку пользователем
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100; // в пределах 100px от нижней границы
    
    setUserScrolled(!isAtBottom);
  };

  useEffect(() => {
     // Прокручивать вниз только если:
    // 1. Количество сообщений увеличилось (пришло новое сообщение)
    // 2. ИЛИ это первоначальная загрузка сообщений (из пустого массива)
    // 3. И пользователь не прокручивал вверх вручную
    if ((messages.length > prevMessagesLength.current || prevMessagesLength.current === 0) && !userScrolled) {
      //messagesEndRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
      // Найдем scrollable контейнер (это .content внутри CustomScrollbar)
      const scrollContainer = messagesEndRef.current?.parentElement?.parentElement;
      if (scrollContainer) {
      // Прокручиваем до конца, но не заходя на поле ввода
        const targetScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;
        
        // Используем smooth behavior
        scrollContainer.scrollTo({
          top: targetScroll,
          behavior: 'smooth'
        });
      }
    }
    
    prevMessagesLength.current = messages.length;
  }, [messages, userScrolled]);

  // Кнопка для прокрутки вниз
  const scrollToBottom = () => {
    //messagesEndRef.current?.scrollBy({ top: -60, behavior: 'smooth' });
    // Найдем scrollable контейнер (это .content внутри CustomScrollbar)
    const scrollContainer = messagesEndRef.current?.parentElement?.parentElement;
    if (scrollContainer) {
      // Прокручиваем до конца, но не заходя на поле ввода
      const targetScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;
      
      // Используем smooth behavior
      scrollContainer.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });
    }
    setUserScrolled(false);
  };

  return (
    

    <CustomScrollbar className={styles.messageListAllWindow}>
      <div className={styles.messageList}>
      
      {isLoading ? <div className={styles.EmptyChatList}>Загрузка...</div> : messages.length === 0 && <div className={styles.EmptyChatList}>Сообщений нет</div>}

    
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
      
      <div ref={messagesEndRef} style={{ height: '1px', margin: '0' }} />
      
    
    </div>

    {userScrolled && messages.length > 0 && (
      <button 
        type="button"
        onClick={scrollToBottom} 
        className={styles.scrollToBottomButton}
        style={{
          position: 'absolute', 
          bottom: '20px', 
          right: '20px',
          zIndex: 10,
          padding: '10px',
          borderRadius: '50%',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        ↓
      </button>
    )}

    </CustomScrollbar>

    
  );
};