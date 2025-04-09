import { Squircle } from '../ultimate-squircle/squircle-js';
import  UserAvatar  from '../UserAvatar/UserAvatar';
import styles from './RightPanel.module.css';

import { CustomScrollbar } from '../CustomScrollbar/CustomScrollbar';
import { useChatMessages } from '../../contexts/ChatMessagesContext';

// Пример данных
const userDetails = {
  name: 'John Pork',//'Константинова-Красильникова Капитолина Константиновна'
  department: 'IT department',
  userId: '@JohnPork',
  phoneNumber: '8 800 555 3535',
  workingHours: '8:00 - 20:00',
  commonGroups: 'Dev Team, 4th quarter report',
};

const files = Array.from({ length: 60 }, (_, i) => ({
  id: i + 1,
  url: 'src/assets/dog.png',//`https://via.placeholder.com/65?text=File+${i + 1}`,
}));

export const RightPanel = () => {
  const {ActiveChatUser} = useChatMessages();
  // Вычисляем стиль с использованием пропсов
  //const FileItemStyle = {
  //  width: `${80}px`,
  //  height: `${80}px`,
  //};
  return (
    <div className={styles.contactFrame}>
      <CustomScrollbar className={styles.contactFrameScroll}>
      {/* Информация о пользователе */}
      <div className={styles.aboutPerson}>
        <div className={styles.person}>
        <UserAvatar 
        src = 'src/assets/john_pork.png' 
        alt = 'User' 
        defaultWidth = {128} 
        defaultHeight = {128} 
        cornerRadius = {40} 
        cornerSmoothing = {1}
        >
          <div className={styles.statusIndicator}></div>
        </UserAvatar>
        {/*
          <div className={styles.avatar}>
            <img src="https://via.placeholder.com/128" alt="Avatar" />
            <div className={styles.statusIndicator}></div>
          </div>
           */}
          <div className={styles.userInfo}>
            {/*<div className={styles.userName}>{userDetails.name}</div>*/}
            <div className={styles.userName}>{ActiveChatUser.name}</div>
            <div className={styles.userDepartment}>{userDetails.department}</div>
          </div>
        </div>

        {/* Дополнительная информация */}
        <div className={styles.infoSection}>
          <div className={styles.section_header}>Info</div>
          <div className={styles.info}>
            <div className={styles.detail}>
              <div>{userDetails.workingHours}</div>
              <div className={styles.detailLabel}>working hours</div>
            </div>
            <div className={styles.detail}>
              <div>{userDetails.userId}</div>
              <div className={styles.detailLabel}>User ID</div>
            </div>
            <div className={styles.detail}>
              <div>{userDetails.phoneNumber}</div>
              <div className={styles.detailLabel}>Phone Number</div>
            </div>
            <div className={styles.detail}>
              <div>{userDetails.commonGroups}</div>
              <div className={styles.detailLabel}>common groups</div>
            </div>
          </div>
        </div>
      </div>

      {/* Файлы */}
      <div className={styles.filesSection}>
        <div className={styles.section_header}>Files</div>
        <CustomScrollbar>
        <div className={styles.fileGridFadeTop}></div>
        <div className={styles.fileGrid}>
          
          
          {/*
            <div key={file.id} className={styles.fileItem}>
              <img src={file.url} alt={`File ${file.id}`} />
            </div>
             */}
             {/*onClick={() => setIsOpen(true)}*/}
          {files.map((file) => (
            

            <Squircle key={file.id}
              className={styles.fileItem}

              style={
                {
                width: `${80}px`,
                height: `${80}px`,
              }
              }

              cornerRadius={15}
              cornerSmoothing={1}
                
              defaultWidth={80}
              defaultHeight={80}
              
                
                
              asChild
                
            >
              <img src={file.url} alt={`File ${file.id}`} />
                
            </Squircle>
            
          ))}
        </div>
        <div className={styles.fileGridFadeBottom}></div>
        </CustomScrollbar>
      </div>
    </CustomScrollbar>
    </div>
  );
};