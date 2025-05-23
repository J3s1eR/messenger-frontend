import { useState, useRef, useEffect } from "react";
import { Squircle } from '../ultimate-squircle/squircle-js';
import styles from './MessageBubble.module.css';

import BubbleTailIncoming from "../../assets/Bubble_Tail_incoming_React_v2.svg";
import BubbleTailOutgoing from "../../assets/Bubble_Tail_outgoing_React_v2.svg";
import Checkmarks_Of_Receipt from "../../assets/Checkmarks_Of_Receipt_React.svg";
import Checkmarks_Of_Receipt_v2 from "../../assets/Checkmarks_Of_Receipt_v2_React.svg";
import Checkmarks_Of_Reading from "../../assets/Checkmarks_Of_Reading_React.svg";

import { Payload } from '../../services/CustomTypes';


type MessageProps = {
  text: string;
  isOwn: boolean;
  attachments?: Payload;
  timestamp?: string;

  isFirstInGroup?: boolean;
  isLastInGroup?: boolean;

  isReaded?: boolean;
};

export const MessageBubble = ({ 
  text, 
  isOwn, 
  attachments,
  timestamp,
  isFirstInGroup,
  isLastInGroup,
  isReaded,
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
    <div className={`${styles.messageRow} ${isOwn ? styles.own : ''}`}>
    <div className={`${styles.message} ${isOwn ? styles.own : ''} ${isFirstInGroup ? styles.firstInGroup : ''} ${isLastInGroup ? styles.lastInGroup : ''}`}>

      {/*@ts-ignore*/} {/*Временное решение для исправления ошибки (для сборки)*/}
      {isOwn ? null : <BubbleTailIncoming className={`${styles.BubbleTail} ${styles.Incoming} ${isLastInGroup ? styles.lastInGroup : ''}`} width={34} height={19} color="#5196FF"/>}
      
      
      
      

      <Squircle 
        //cornerRadius={12}

        topLeftCornerRadius={10}//Левый верхний
        topRightCornerRadius={10}//Правый верхний
        bottomLeftCornerRadius={(!isOwn && isLastInGroup) ? 10 : 10}//Левый нижний //если сообщение не моё и последнее (в "группе" сообщений от этого пользователя), то острый угол слева снизу
        bottomRightCornerRadius={(isOwn && isLastInGroup) ? 10 : 10}//Правый нижний //если сообщение моё и последнее (в "группе" сообщений от этого пользователя), то острый угол справа снизу

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
        {attachments?.images.map(attachment => (
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

        {attachments?.other_type_files?.map(attachment => (
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
            <a 
              href={attachment} 
              download 
              title="Скачать"
              className={styles.downloadLink}
            >
              🡇
            </a>
          </Squircle>
        ))}
        <div className={`${styles.text} ${isOwn ? 'text-white' : ''}`}>
          {text}
        </div>
        </div>
      </Squircle>

      


      {/*@ts-ignore*/} {/*Временное решение для исправления ошибки (для сборки)*/}
      {isOwn ? <BubbleTailOutgoing className={`${styles.BubbleTail} ${styles.Outgoing} ${isLastInGroup ? styles.lastInGroup : ''}`} width={34} height={19} color="#39DA1F"/> : null}
      
      {timestamp && <div className={styles.timestamp}>{timestamp}</div>}

      {/*@ts-ignore*/} {/*Временное решение для исправления ошибки (для сборки)*/}
      {isOwn ? (isReaded ? <Checkmarks_Of_Reading className={`${styles.Checkmarks} ${styles.OfReading} ${isLastInGroup ? '' : ''}`} width={14} height={11} color="#B7B7B7"/> 
      //@ts-ignore //Временное решение для исправления ошибки (для сборки)
      : <Checkmarks_Of_Receipt_v2 className={`${styles.Checkmarks} ${styles.OfReceipt} ${isLastInGroup ? '' : ''}`} width={14} height={11} color="#9B9B9B"/>) 
      : null}
    </div>
    </div>
  );
};