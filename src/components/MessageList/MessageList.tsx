import { useEffect, useRef, useState } from 'react';
import { MessageBubble } from '../MessageBubble/MessageBubble';
import styles from './MessageList.module.css';

import { CustomScrollbar } from '../CustomScrollbar/CustomScrollbar';

import { useChatMessages } from '../../contexts/ChatMessagesContext';
import { useAuth } from '../../contexts/AuthContext';



//export const MessageList = ({ messages }: MessageListProps) => {
export const MessageList = () => {
  const {messages, MessagesForChatWithContext, isLoading} = useChatMessages();
  const {getMyUid} = useAuth();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  //const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [userScrolled, setUserScrolled] = useState(false);
  const prevMessagesLength = useRef(0);

  // Отслеживаем прокрутку пользователем
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    //console.log(`MessageList.tsx:\handleScroll():\nscrolled`)
    const messagesEndRefEl = messagesEndRef.current;
    console.log(`___________________________`);
    console.log(`MessageList/MessageList.tsx:\nscrollToBottom\nmessagesEndRefEl.getBoundingClientRect().bottom:`, messagesEndRefEl!.getBoundingClientRect().bottom);
    const target = event.currentTarget;
    const { scrollTop, scrollHeight, clientHeight } = target;
    console.log(`MessageList/MessageList.tsx:\nscrollToBottom\scrollHeight:`, scrollHeight);
    console.log(`MessageList/MessageList.tsx:\nscrollToBottom\nscrollHeight - messagesEndRefEl!.getBoundingClientRect().bottom:`, scrollHeight - messagesEndRefEl!.getBoundingClientRect().bottom);
    //console.log(`MessageList.tsx:\handleScroll():\nscrollTop:`, scrollTop, `\nscrollHeight:`, scrollHeight, `\nclientHeight:`, clientHeight);
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
    // Найдем scrollable контейнер (это .content внутри CustomScrollbar)
    const scrollContainer = messagesEndRef.current?.parentElement?.parentElement;
    const messagesEndRefEl = messagesEndRef.current;
    const messageInputRefEl = scrollContainer?.parentElement?.nextElementSibling


    if (messagesEndRefEl && messageInputRefEl) {
      const inputHeight = messageInputRefEl.clientHeight;
      // Прокручиваем до конца, но не заходя на поле ввода
      //const targetScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight - inputHeight - messagesEndRefEl.getBoundingClientRect().bottom;
      //const targetScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight - (scrollContainer.scrollHeight - messagesEndRefEl.getBoundingClientRect().bottom);
      
      const targetScroll = messagesEndRefEl.getBoundingClientRect().bottom - scrollContainer.clientHeight + inputHeight;
      console.log(`___________________________`);
      console.log(`MessageList/MessageList.tsx:\nscrollToBottom\nscrollContainer.scrollHeight:`, scrollContainer.scrollHeight);
      console.log(`MessageList/MessageList.tsx:\nscrollToBottom\nscrollContainer.scrollHeight - messagesEndRefEl.getBoundingClientRect().bottom:`, scrollContainer.scrollHeight - messagesEndRefEl.getBoundingClientRect().bottom);
      console.log(`MessageList/MessageList.tsx:\nscrollToBottom\nscrollContainer.clientHeight:`, scrollContainer.clientHeight);
      console.log(`MessageList/MessageList.tsx:\nscrollToBottom\ninputHeight:`, inputHeight);
      console.log(`MessageList/MessageList.tsx:\nscrollToBottom\nscrollContainer.getBoundingClientRect().top:`, scrollContainer.getBoundingClientRect().top);
      console.log(`MessageList/MessageList.tsx:\nscrollToBottom\nmessagesEndRefEl.getBoundingClientRect().top:`, messagesEndRefEl.getBoundingClientRect().top);
      console.log(`MessageList/MessageList.tsx:\nscrollToBottom\nmessagesEndRefEl.getBoundingClientRect().bottom:`, messagesEndRefEl.getBoundingClientRect().bottom);
      console.log(`MessageList/MessageList.tsx:\nscrollToBottom\ntargetScroll:`, targetScroll);

      //const targetScroll = messagesEndRef.current?.offsetTop ?? 0;
      //const targetScroll = messagesEndRef.current?.getBoundingClientRect().top ?? 0;
      
      scrollContainer.scrollBy({
        top: targetScroll,
        left: 0,

        behavior: 'auto'

      });


      // Используем smooth behavior
      //messagesEndRefEl.scrollIntoView({
      //  block: 'end',
      //  behavior: 'smooth'
      //});

      //setTimeout(() => {
      //  // Корректируем позицию прокрутки, чтобы не перекрывать инпут
      //  const scrollOffset = inputHeight;
      //  console.log(`MessageList/MessageList.tsx:\nscrollToBottom\nscrollOffset:`, scrollOffset);
      //
      //  if(scrollContainer){
      //    scrollContainer.scrollBy({
      //      top: scrollOffset, 
      //      left: 0, 
      //      behavior: 'smooth'
      //    });
      //  }
      //}, 1000); // Добавляем задержку 

    }
    //setUserScrolled(false);
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

      {MessagesForChatWithContext.newMessagesCount > 0 && (
        Array.from({ length: MessagesForChatWithContext.newMessagesCount }).map((_, index) => (
          <MessageBubble
            key={`empty-message-${index}`}
            text=""
            isOwn={false}
            isFirstInGroup={false}
            isLastInGroup={false}
          />
        ))
      )}

    
    </div>
    

    {isLoading ? <></> : messages.length !== 0 &&  <>

      <button 
        type="button"
        onClick={scrollToBottom} 
        className={`${styles.scrollToBottomButton} ${userScrolled ? styles.Visible : styles.Hidden}`}
      >
        ↓
      </button>
       
    </>}

       
    </CustomScrollbar>

    
  );
};