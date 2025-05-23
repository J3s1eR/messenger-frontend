import { Squircle } from '../ultimate-squircle/squircle-js';
import styles from './MessageInput.module.css';
import { useState , useRef, useEffect, use } from 'react';
//import { useState} from "react";

import AttachmentIcon from "../../assets/Attachment_Icon_React.svg";
import EmojiIcon from "../../assets/Emoji_Icon_React.svg";

import FileUploader from '../FileUploader/FileUploader';
import EmojiPicker from '../EmojiPicker/EmojiPicker';

import { FileUploaderHandle } from '../FileUploader/FileUploader';

type MessageInputProps = {
  addMessage: (text: string, files: File[]) => void;
  ref: React.RefObject<HTMLDivElement | null>;
  droppedFiles?: File[];
};

const MessageInput = ({ addMessage, ref, droppedFiles }: MessageInputProps) => {
  const [message, setMessage] = useState('');
  const [ShowUploadButton, setShowUploadButton] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  
  const handleSend = () => {
    const text = message.trim();
    // Логика отправки сообщения
    const files = uploaderRef.current?.getFiles() || [];
    console.log(`MessageInput.tsx\nhandleSend()\ntext: ${text}\nfiles: ${files}`);
    if (text || files.length > 0){
      console.log('Отправка сообщения:', text, files);
      addMessage(text, files); // Можно передать payload, если addMessage принимает объект
      
      setMessage('');
      uploaderRef.current?.clearFiles?.();
      // Добавляем сообщение в список
      //addMessage(message.trim());
      //console.log(message.trim())
      //setMessage('');
    }
  };

  
  const uploaderRef = useRef<FileUploaderHandle>(null);

  const MessageInputRef = useRef<HTMLDivElement>(null);
  const [MessageInputSize, setMessageInputSize] = useState({ width: 0, height: 0 });

  const squircleRef = useRef<any>(null);
                  

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      if (entry) {
        const { width, height } = entry.contentRect;
        setMessageInputSize({ width, height });
      }
    });

    if (MessageInputRef.current) {
      observer.observe(MessageInputRef.current);
      // Дополнительно получаем размеры через getBoundingClientRect
      const { width, height } = MessageInputRef.current.getBoundingClientRect();
      setMessageInputSize({ width, height });
    }

    if (squircleRef.current) {
      console.log(`useEffect: squircleRef.current.forceUpdateClipPath()`)
      squircleRef.current.forceUpdateClipPath();
    } 

    return () => {
      if (MessageInputRef.current) observer.unobserve(MessageInputRef.current);
    };
  }, [ShowUploadButton, droppedFiles, uploaderRef.current?.getFiles()?.length]);


  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  return (
    
    <div ref={ref} className={styles.inputContainerMain}>
    <Squircle 
      //cornerRadius={20}
      topLeftCornerRadius={20}//Левый верхний
      topRightCornerRadius={20}//Правый верхний
      bottomLeftCornerRadius={0}//Левый нижний
      bottomRightCornerRadius={0}//Правый нижний

      ref={squircleRef}

      cornerSmoothing={1}
      //defaultWidth={800} //ширина терерь регулируется кодом сверху
      //defaultHeight={60}
      className={styles.inputContainer}
      style={{
        //minWidth: "392px",//400 - 8, которые нужны для отступа для скроллбара (можно в принципе не указывать(регулируется в стилях родительского элемента(ChatWindow), а отступ указывается в стилях текущего элемента))
        minHeight: '60px',
        maxHeight: '880px',
        width: `${MessageInputSize.width}px`,
        //height: `60px`,
        //height: `${MessageInputSize.height}px`,
        height: `${MessageInputSize.height}px`,
        //height: `fit-content`,
      }}
    >
      {ShowUploadButton ? <FileUploader ref={uploaderRef} squircleRef={squircleRef} className={styles.FileUploaderShow} externalFiles={droppedFiles}/> 
      : <FileUploader ref={uploaderRef} squircleRef={squircleRef} className={styles.FileUploaderHidden} externalFiles={droppedFiles}/>}
      

      <div className={styles.inputWrapper}>
        {/*<button className={styles.attachmentBtn} onClick={() => console.log('Attach file')}>
          📎
        </button>*/}

        {/*@ts-ignore*/} {/*Временное решение для исправления ошибки (для сборки)*/}
        <AttachmentIcon className={styles.attachmentBtn} width={30} height={30} color="#1A1A1A" 
        onClick={() => {
          setShowUploadButton(prev => !prev)//инвертируем состояние
          squircleRef.current?.forceUpdateClipPath();
          console.log('Attachment')}}
          />
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
        <EmojiIcon className={styles.emojiBtn} width={30} height={30} color="#1A1A1A" onClick={() => {
          setShowEmojiPicker(prev => !prev)  
          console.log('Emoji')}}
        />

        

        <button 
          className={styles.sendBtn}
          onClick={handleSend} 
          //disabled={!message.trim()} //проверка пустого сообщения выполняется в функции handleSend()
        >➚</button>
      </div>
    </Squircle>

    <EmojiPicker
          visible={showEmojiPicker}
          onSelect={handleEmojiSelect}
          onClose={() => setShowEmojiPicker(false)}
        />
    </div>
  );
};

export default MessageInput;