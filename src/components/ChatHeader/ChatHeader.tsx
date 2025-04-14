import { useState, useRef, useEffect } from "react";
import { Squircle } from '../ultimate-squircle/squircle-js';
import styles from './ChatHeader.module.css';

import SearchIcon from "../../assets/Search_Icon_react.svg";

import { useChatMessages } from '../../contexts/ChatMessagesContext';

import { useAuth } from '../../contexts/AuthContext';

export const ChatHeader = () => {
  const ChatHeaderRef = useRef<HTMLDivElement>(null);
  const [ChatHeaderSize, setChatHeaderSize] = useState({ width: 0, height: 0 });
			  
  const {ActiveChatUser, isLoading} = useChatMessages();
  const {getMyUid} = useAuth();
					 
		  
																	

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      if (entry) {
        const { width, height } = entry.contentRect;
        
        setChatHeaderSize({ width, height });
      }
    });

    if (ChatHeaderRef.current) {
      observer.observe(ChatHeaderRef.current);
    }

    return () => {
      if (ChatHeaderRef.current) observer.unobserve(ChatHeaderRef.current);
    };
  }, []);




  return (
    <div >{/*className={styles.header}*/}
      <Squircle 
        //className={styles.avatar}
        //cornerRadius={12}

        topLeftCornerRadius={0}//Левый верхний
        topRightCornerRadius={0}//Правый верхний
        bottomLeftCornerRadius={20}//Левый нижний
        bottomRightCornerRadius={20}//Правый нижний
        cornerSmoothing={1}

        //defaultWidth={800} //ширина терерь регулируется кодом сверху
        defaultHeight={72}
        className={styles.header}
        style={{
          //minWidth: "392px",//400 - 8, которые нужны для отступа для скроллбара (можно в принципе не указывать(регулируется в стилях родительского элемента(ChatWindow), а отступ указывается в стилях текущего элемента))
          minHeight: '72px',
          maxHeight: '72px',
          width: `${ChatHeaderSize.width}px`,
          height: `72px`,
        }}
      ><div></div>
        {/*<img src="../../assets/dog.png" alt="Contact" className={styles.avatar}/>*/}
      
      <div className={styles.info}>
        <div>
        {isLoading ? 'Загрузка...' : ActiveChatUser?.uid === getMyUid() ? 'Избранное' : ActiveChatUser?.name}
          </div>
        <span className={styles.status}>Online</span>
      </div>
      <div className={styles.actions}>
        {/*<button className={styles.actionButton}>
          🔍
        </button>
        <button className={styles.actionButton}>
          ⋮
        </button>*/}

        {/*@ts-ignore*/} {/*Временное решение для исправления ошибки (для сборки)*/}
        <SearchIcon className={styles.search_icon} width={30} height={30} color="#1A1A1A" onClick={() => console.log('Search')}/>
        <div  className={styles.actionButton_2} onClick={() => console.log('DropDownChatMenu')}>
          <div className={styles.actionButton_Item}/>
          <div className={styles.actionButton_Item}/>
          <div className={styles.actionButton_Item}/>
        </div>
      </div>
      </Squircle>
    </div>
  );
};