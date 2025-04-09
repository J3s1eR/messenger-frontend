import { Squircle } from '../ultimate-squircle/squircle-js';
import styles from './MessageInput.module.css';
import { useState , useRef, useEffect } from 'react';
//import { useState} from "react";

import AttachmentIcon from "../../assets/Attachment_Icon_React.svg";
import EmojiIcon from "../../assets/Emoji_Icon_React.svg";

type MessageInputProps = {
  addMessage: (text: string) => void;
};

const MessageInput = ({ addMessage }: MessageInputProps) => {
  const [message, setMessage] = useState('');
  
  const handleSend = () => {
    if (message.trim()) {
      // Логика отправки сообщения
      // Добавляем сообщение в список
      addMessage(message.trim());
      console.log(message.trim())
      setMessage('');
    }
  };


  const MessageInputRef = useRef<HTMLDivElement>(null);
  const [MessageInputSize, setMessageInputSize] = useState({ width: 0, height: 0 });
			  
		   
					 
		  
																	

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      if (entry) {
        const { width, height } = entry.contentRect;
        
        setMessageInputSize({ width, height });
      }
    });

    if (MessageInputRef.current) {
      observer.observe(MessageInputRef.current);
    }

    return () => {
      if (MessageInputRef.current) observer.unobserve(MessageInputRef.current);
    };
  }, []);

  return (
    
    <Squircle 
      //cornerRadius={20}
      topLeftCornerRadius={20}//Левый верхний
      topRightCornerRadius={20}//Правый верхний
      bottomLeftCornerRadius={0}//Левый нижний
      bottomRightCornerRadius={0}//Правый нижний

      cornerSmoothing={1}
      //defaultWidth={800} //ширина терерь регулируется кодом сверху
      defaultHeight={60}
      className={styles.inputContainer}
      style={{
        //minWidth: "392px",//400 - 8, которые нужны для отступа для скроллбара (можно в принципе не указывать(регулируется в стилях родительского элемента(ChatWindow), а отступ указывается в стилях текущего элемента))
        minHeight: '60px',
        maxHeight: '60px',
        width: `${MessageInputSize.width}px`,
        height: `60px`,
      }}
    >
      <div className={styles.inputWrapper}>
        {/*<button className={styles.attachmentBtn} onClick={() => console.log('Attach file')}>
          📎
        </button>*/}

        {/*@ts-ignore*/} {/*Временное решение для исправления ошибки (для сборки)*/}
        <AttachmentIcon className={styles.attachmentBtn} width={30} height={30} color="#1A1A1A" onClick={() => console.log('Attachment')}/>
        <input
          type="text"
          placeholder="Напишите сообщение..."
          className={styles.input}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        {/*<button className={styles.emojiBtn}>😊</button>*/}

        {/*@ts-ignore*/} {/*Временное решение для исправления ошибки (для сборки)*/}
        <EmojiIcon className={styles.emojiBtn} width={30} height={30} color="#1A1A1A" onClick={() => console.log('Emoji')}/>
        <button 
          className={styles.sendBtn}
          onClick={handleSend}
          disabled={!message.trim()}
        >➚</button>
      </div>
    </Squircle>
    
  );
};

export default MessageInput;