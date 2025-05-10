import React, { useEffect, useRef, useState } from 'react';
import { MessageBubble } from '../MessageBubble/MessageBubble';
import styles from './MessageList.module.css';

import { CustomScrollbar } from '../CustomScrollbar/CustomScrollbar';

import { useChatMessages } from '../../contexts/ChatMessagesContext';
import { useAuth } from '../../contexts/AuthContext';

type MessageListProps ={
  messageInputRef: React.RefObject<HTMLDivElement | null>;
}

//export const MessageList = ({ messages }: MessageListProps) => {
export const MessageList = ({messageInputRef}: MessageListProps) => {

  const {messages, MessagesForChatWithContext, isLoading} = useChatMessages();
  const {getMyUid} = useAuth();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const newMessagesEndRef = useRef<HTMLDivElement>(null);

  //const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [userScrolledUp, setuserScrolledUp] = useState(false);
  const [canReadNewMessages, setCanReadNewMessages] = useState(false);
  const prevMessagesLength = useRef(0);

  // Отслеживаем прокрутку пользователем
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    //console.log(`MessageList.tsx:\handleScroll():\nscrolled`)
    const target = event.currentTarget;

    const scrollContainer = messagesEndRef.current?.parentElement?.parentElement;
    const messagesEndRefEl = messagesEndRef.current;
    const newMessagesEndRefEl = newMessagesEndRef.current;
    const messageInputRefEl = messageInputRef.current;

    const { scrollTop, scrollHeight, clientHeight } = target;
    //console.log(`MessageList.tsx:\handleScroll():\nscrollTop:`, scrollTop, `\nscrollHeight:`, scrollHeight, `\nclientHeight:`, clientHeight);

    if(messagesEndRefEl && messageInputRefEl && scrollContainer && newMessagesEndRefEl) {
      const inputHeight = messageInputRefEl.clientHeight;
      //console.log(`MessageList.tsx:\handleScroll():\nmessagesEndRefEl:`, messagesEndRefEl)
      //console.log(`MessageList.tsx:\handleScroll():\nmessageInputRefEl:`, messageInputRefEl)

      // messagesEndRefEl.getBoundingClientRect().bottom -- сколько осталось прокрутить, чтобы messagesEndRefEl оказался наверху видимой части экрана
      // messagesEndRefEl.getBoundingClientRect().bottom - clientHeight -- сколько осталось прокрутить, чтобы messagesEndRefEl оказался внизу видимой части экрана 
      // messagesEndRefEl.getBoundingClientRect().bottom - clientHeight + inputHeight -- сколько осталось прокрутить, чтобы messagesEndRefEl оказался внизу видимой части экрана, и не перекрывался полем ввода, а был чуть выше его границы 
      const diff = messagesEndRefEl.getBoundingClientRect().bottom - clientHeight + inputHeight;
      const isAtBottom = diff < 100;
      console.log(`MessageList.tsx:\handleScroll():\ndiff:`, diff, `\nisAtBottom:`, isAtBottom);
      
      //const isAtBottom = scrollHeight - scrollTop - clientHeight < 100; // в пределах 100px от нижней границы
      
      //console.log(`MessageList.tsx:\handleScroll():\nsetuserScrolledUp(`, !isAtBottom, `)`)
      //console.log(`MessageList.tsx:\handleScroll():\nscrollHeight:`, scrollHeight, `\nscrollTop:`, scrollTop, `\nclientHeight:`, clientHeight, `\nisAtBottom:`, isAtBottom);
      
      setuserScrolledUp(!isAtBottom);


      //после прокрутки старых сообщений, проверяем, можно ли прочитать все новые сообщения разом, или пользователь промотал их до конца
      const diff2 = newMessagesEndRefEl.getBoundingClientRect().bottom - clientHeight + inputHeight;
      const canReadAllNewMessages = diff2 > 10;  
      console.log(`MessageList.tsx:\handleScroll():\ndiff2:`, diff2, `\ncanReadAllNewMessages:`, canReadAllNewMessages);

      setCanReadNewMessages(canReadAllNewMessages);



    }
  };

  useEffect(() => {
     // Прокручивать вниз только если:
    // 1. Количество сообщений увеличилось (пришло новое сообщение)
    // 2. ИЛИ это первоначальная загрузка сообщений (из пустого массива)
    // 3. И пользователь не прокручивал вверх вручную
    if ((messages.length > prevMessagesLength.current || prevMessagesLength.current === 0) && !userScrolledUp) {
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
  }, [messages, userScrolledUp]);

  // Кнопка для прокрутки вниз
  const scrollToBottom = () => {
    // Найдем scrollable контейнер (это .content внутри CustomScrollbar)
    const scrollContainer = messagesEndRef.current?.parentElement?.parentElement;
    const messagesEndRefEl = messagesEndRef.current;
    //const messageInputRefEl = scrollContainer?.parentElement?.nextElementSibling
    const messageInputRefEl = messageInputRef.current;
    
    //если пользователь прокрутил вверх, возвращаем его к концу прочитанных сообщений
    if(userScrolledUp){
      if (messagesEndRefEl && messageInputRefEl && scrollContainer) {
        const inputHeight = messageInputRefEl.clientHeight;
        // Прокручиваем до конца, но не заходя на поле ввода
        //scrollContainer.clientHeight – высота контейнера с сообщениями (видимая часть в браузере)
        //scrollContainer.scrollHeight – вся высота контейнера с сообщениями (выходит за границы экрана в браузере (сверху и снизу))
        
        //inputHeight -- высота поля ввода
        
        // messagesEndRefEl.getBoundingClientRect().bottom -- сколько осталось прокрутить, чтобы messagesEndRefEl оказался наверху видимой части экрана
        // messagesEndRefEl.getBoundingClientRect().bottom - scrollContainer.clientHeight -- сколько осталось прокрутить, чтобы messagesEndRefEl оказался внизу видимой части экрана 
        // messagesEndRefEl.getBoundingClientRect().bottom - scrollContainer.clientHeight + inputHeight -- сколько осталось прокрутить, чтобы messagesEndRefEl оказался внизу видимой части экрана, и не перекрывался полем ввода, а был чуть выше его границы 
        const targetScroll = messagesEndRefEl.getBoundingClientRect().bottom - scrollContainer.clientHeight + inputHeight;

        scrollContainer.scrollBy({
          top: targetScroll,
          left: 0,
          behavior: 'smooth'
        });
      }
      setuserScrolledUp(false);
    }
    //если пользователь уже прокрутил до конца прочитанных сообщений, прокручиваем в самый низ, показывая новые сообщения
    else if(!userScrolledUp){
      if (scrollContainer) {
        // Прокручиваем до конца, но не заходя на поле ввода
        const targetScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;
        
        // Используем smooth behavior
        scrollContainer.scrollTo({
          top: targetScroll,
          behavior: 'smooth'
        });
      }
      setCanReadNewMessages(false);
    }
  };

  return (
    <CustomScrollbar className={styles.messageListAllWindow} onScroll={handleScroll}>
      <div className={styles.messageList}>
      
      {isLoading ? <div className={styles.EmptyChatList}>Загрузка...</div> : messages.length === 0 && <div className={styles.EmptyChatList}>Сообщений нет</div>}

      {messages.map((message, index)  => {
        const currentSender = message.sender;
        const prevSender = index > 0 ? messages[index - 1].sender : null;
        const nextSender = index < messages.length - 1 ? messages[index + 1].sender : null;
      
        const isFirstInGroup = currentSender !== prevSender;
        const isLastInGroup = currentSender !== nextSender;
        const isOwn = message.sender === getMyUid() ? true : false;
        return(
        <MessageBubble 
          /*key={message.id}
          text={message.text}
          isOwn={message.isOwn}
          attachments={message.attachments}*/
          key={message.num}
          text={message.message}
          isOwn={isOwn}
          isFirstInGroup={isFirstInGroup}
          isLastInGroup={isLastInGroup}
          //attachments={message.attachments} //пока нет поддержки
        />);
      }
      )}

      {isLoading ? <></> : messages.length !== 0 &&  <>
        <div className={styles.OldNewMessagesDeviderContainer}> 
          <div className={styles.OldNewMessagesDeviderLine}></div>
            <div className={styles.OldNewMessagesDeviderContent}>Новые сообщения ({MessagesForChatWithContext.newMessagesCount})</div>
          <div className={styles.OldNewMessagesDeviderLine}></div>
        </div>
        
        <div ref={messagesEndRef} className={styles.messagesEndRef}/>
      </>}

      {isLoading ? <></> : messages.length !== 0 && MessagesForChatWithContext.newMessagesCount > 0 && 
      (
        Array.from({ length: MessagesForChatWithContext.newMessagesCount }).map((_, index) => (
          <MessageBubble
            key={`empty-message-${index}`}
            text=""
            isOwn={false}
            isFirstInGroup={false}
            isLastInGroup={false}
          />
        ))
      )
      }

      {isLoading ? <></> : messages.length !== 0 &&  (
      <div ref={newMessagesEndRef} className={styles.messagesEndRef}/>
      )
      }

    
    </div>
    

    {isLoading ? <></> : messages.length !== 0 &&  <>
      <div className={styles.scrollToBottom}>
        {/*MessagesForChatWithContext.newMessagesCount > 0 && */}
            <div className={`${styles.Count} ${MessagesForChatWithContext.newMessagesCount > 0 ? canReadNewMessages ? styles.Visible : styles.Hidden : styles.Hidden}`}>
              {MessagesForChatWithContext.newMessagesCount}
            </div>
        {/**/}
        
        <button 
          type="button"
          onClick={scrollToBottom} 
          className={`${styles.scrollToBottomButton} 
          ${userScrolledUp ? styles.Visible : canReadNewMessages ? styles.Visible : styles.Hidden}`}
        >

          ↓
        </button>
      </div> 
    </>}

       
    </CustomScrollbar>

    
  );
};