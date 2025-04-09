import { Squircle } from '../ultimate-squircle/squircle-js';
import styles from './FolderList.module.css';

import FolderIcon from "../../assets/Folder_Icon_react.svg";
import TruncatedText from '../TruncatedText/TruncatedText';


const folders = [
  { id: 1, name: 'All', name_icon: '📁', count: 5 },
  { id: 2, name: 'Messenger-frontend', name_icon: '', count: 3 },
  { id: 3, name: 'Messenger-backend', name_icon: '💼', count: 2 },
  { id: 4, name: 'Folder Name', name_icon: '💼', count: 0 },
  { id: 5, name: 'Команда 1', name_icon: '💼', count: 0 },
  { id: 6, name: 'Важныеdfgdghdfgjdofg dfokd dfgk', name_icon: '', count: 8 },
  { id: 7, name: 'Folder Name  sdfxgdfg', name_icon: '', count: 0 },
  { id: 8, name: 'Команда ', name_icon: '', count: 8 },
];


const FolderList = () => {
  return (
    
    <div className={styles.folderList}>
          
      {folders.map(folder => (
        <Squircle
          key={folder.id}
          className={styles.folderItem}

          //cornerRadius={10}

          topLeftCornerRadius={0}//Левый верхний
          topRightCornerRadius={0}//Правый верхний
          bottomLeftCornerRadius={0}//Левый нижний
          bottomRightCornerRadius={0}//Правый нижний
          cornerSmoothing={0}
  
          defaultWidth={84}
          defaultHeight={87}

          onClick={() => console.log(`Open ${folder.name}`)}
        >
          {/*условный рендеринг*/}
          {folder.count > 0 ? (<span className={styles.count}>{folder.count}</span>) : (<span  className={` ${styles.count} ${styles.count_invisible}`}>{folder.count}</span>)}
          {/*<img 
            src="src/assets/Folder_Icon.svg"
            alt="Folder"
            className={styles.folder_icon}
          />
          <FolderIcon className="folder_icon" width={50} height={50} />
          */}

          {/*@ts-ignore*/} {/*Временное решение для исправления ошибки (для сборки)*/}
          <FolderIcon className={styles.folder_icon} width={68} height={55} color="#D9D9D9"/>

          
          <div className={styles.full_name}>
            
            {/*<span className={styles.name_icon}>{folder.name_icon}</span> 
            <span className={styles.name}>{folder.name}</span>
            */}
            
            <TruncatedText className={styles.name} text={folder.name} maxLength={25}></TruncatedText>
          </div>
          


        </Squircle>
      ))}

    </div>
  );
};

export default FolderList;