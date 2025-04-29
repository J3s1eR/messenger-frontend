import { useEffect, useRef, useState } from 'react';
import { MessageBubble } from '../MessageBubble/MessageBubble';
import styles from './MessageList.module.css';

import { CustomScrollbar } from '../CustomScrollbar/CustomScrollbar';

import { useChatMessages } from '../../contexts/ChatMessagesContext';
import { useAuth } from '../../contexts/AuthContext';




//export const MessageList = ({ messages }: MessageListProps) => {
export const MessageList = () => {
  const {messages, isLoading} = useChatMessages();
  const {getMyUid} = useAuth();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  //const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [userScrolled, setUserScrolled] = useState(false);
  const prevMessagesLength = useRef(0);

  // Отслеживаем прокрутку пользователем
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    //console.log(`MessageList.tsx:\handleScroll():\nscrolled`)
    const target = event.currentTarget;
    const { scrollTop, scrollHeight, clientHeight } = target;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100; // в пределах 100px от нижней границы

    //console.log(`MessageList.tsx:\handleScroll():\nsetUserScrolled(`, !isAtBottom, `)`)
    //console.log(`MessageList.tsx:\handleScroll():\nscrollHeight:`, scrollHeight, `\nscrollTop:`, scrollTop, `\nclientHeight:`, clientHeight, `\nisAtBottom:`, isAtBottom);
    
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
      //const scrollContainer = messagesEndRef.current?.parentElement;
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
    //const scrollContainer = messagesEndRef.current?.parentElement;
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
    

    <CustomScrollbar className={styles.messageListAllWindow} onScroll={handleScroll}>
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

      {isLoading ? <></> : messages.length !== 0 &&  <>
        <div className={styles.OldNewMessagesDeviderContainer}> 
          <div className={styles.OldNewMessagesDeviderLine}></div>
            <div className={styles.OldNewMessagesDeviderContent}>Новые сообщения</div>
          <div className={styles.OldNewMessagesDeviderLine}></div>
        </div>
        
        <div ref={messagesEndRef} style={{ height: '1px', margin: '0' }} />
      </>}
    
    </div>
    

    {isLoading ? <></> : messages.length !== 0 &&  <>
       {/* {userScrolled && messages.length > 0 && ( */}
       {userScrolled && ( 
        <button 
          type="button"
          onClick={scrollToBottom} 
          className={styles.scrollToBottomButton}
        >
          ↓
        </button>
       )} 
    </>}

       
    </CustomScrollbar>

    
  );
};