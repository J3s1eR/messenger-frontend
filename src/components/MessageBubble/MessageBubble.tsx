import { useState, useRef, useEffect } from "react";
import { Squircle } from '../ultimate-squircle/squircle-js';
import styles from './MessageBubble.module.css';

import BubbleTailIncoming from "../../assets/Bubble_Tail_incoming_react.svg";
import BubbleTailOutgoing from "../../assets/Bubble_Tail_outgoing_react.svg";



type MessageProps = {
  text: string;
  isOwn: boolean;
  attachments?: string[];
  timestamp?: string;

  isFirstInGroup?: boolean;
  isLastInGroup?: boolean;
};

export const MessageBubble = ({ 
  text, 
  isOwn, 
  attachments,
  timestamp,
  isFirstInGroup,
  isLastInGroup,
}: MessageProps) => {

  const bubbleRef = useRef<HTMLDivElement>(null);
  const [bubbleSize, setBubbleSize] = useState({ width: 0, height: 0 });
			  
		   
					 
		  
																	

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      if (entry) {
        const { width, height } = entry.contentRect;
        setBubbleSize({ width, height });
      }
    });

    if (bubbleRef.current) {
      observer.observe(bubbleRef.current);
    }

    return () => {
      if (bubbleRef.current) observer.unobserve(bubbleRef.current);
    };
  }, []);





  return (
    <div className={`${styles.message} ${isOwn ? styles.own : ''} ${isFirstInGroup ? styles.firstInGroup : ''} ${isLastInGroup ? styles.lastInGroup : ''}`}>

      {/*@ts-ignore*/} {/*Временное решение для исправления ошибки (для сборки)*/}
      {isOwn ? null : <BubbleTailIncoming className={`${styles.BubbleTail} ${styles.Incoming} ${isLastInGroup ? styles.lastInGroup : ''}`} width={16} height={14} color="#5196FF"/>}
      

      <Squircle 
        //cornerRadius={12}

        topLeftCornerRadius={10}//Левый верхний
        topRightCornerRadius={10}//Правый верхний
        bottomLeftCornerRadius={(!isOwn && isLastInGroup) ? 0 : 10}//Левый нижний //если сообщение не моё и последнее (в "группе" сообщений от этого пользователя), то острый угол слева снизу
        bottomRightCornerRadius={(isOwn && isLastInGroup) ? 0 : 10}//Правый нижний //если сообщение моё и последнее (в "группе" сообщений от этого пользователя), то острый угол справа снизу

        cornerSmoothing={1}

        className={styles.bubble}
        style={{
          backgroundColor: isOwn ? '#39DA1F' : '#5196FF',
          minWidth: "20px",
          minHeight: 'fit-content',
          width: `${bubbleSize.width}px`,
          height: `${bubbleSize.height}px`,
        }}

         
        
      >
        <div ref={bubbleRef} className={styles.bubbleContent}>
        {attachments?.map(attachment => (
          <Squircle
          key={attachment} className={styles.attachment}
          topLeftCornerRadius={10}//Левый верхний
          topRightCornerRadius={10}//Правый верхний
          bottomLeftCornerRadius={(!isOwn && isLastInGroup) ? 10 : 10}//Левый нижний //если сообщение не моё, то острый угол слева снизу
          bottomRightCornerRadius={(isOwn && isLastInGroup) ? 10 : 10}//Правый нижний //если сообщение моё, то острый угол справа снизу

          cornerSmoothing={1}

          style={{ 
            minWidth: "100%",
            minHeight: "100%",
           }}

          //asChild
          >
            <img src={attachment} alt="Вложение" />
          </Squircle>
        ))}
        <div className={`${styles.text} ${isOwn ? 'text-white' : ''}`}>
          {text}
        </div>
        </div>
      </Squircle>

      {/*@ts-ignore*/} {/*Временное решение для исправления ошибки (для сборки)*/}
      {isOwn ? <BubbleTailOutgoing className={`${styles.BubbleTail} ${styles.Outgoing} ${isLastInGroup ? styles.lastInGroup : ''}`} width={16} height={14} color="#39DA1F"/> : null}
      {timestamp && <div className={styles.timestamp}>{timestamp}</div>}
    </div>
  );
};