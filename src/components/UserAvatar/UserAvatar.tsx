import { useState } from 'react';
import { Squircle } from '../ultimate-squircle/squircle-js';
import styles from './UserAvatar.module.css';

type UserAvatarProps = {
  src?: string; // Путь к изображению
  alt?: string; // Альтернативный текст для изображения
  defaultWidth?: number; // Размер аватара (ширина)
  defaultHeight?: number;// Размер аватара (высота)
  cornerRadius?: number; // Радиус скругления углов
  cornerSmoothing?: number; // Сглаживание углов
  className?: string; // Дополнительные пользовательские стили
  children?: React.ReactNode;
};

const UserAvatar = ({
  src = 'src/assets/avatar.png', // Значение по умолчанию
  alt = 'User',
  defaultWidth = 64,
  defaultHeight = 64,
  cornerRadius = 20,
  cornerSmoothing = 1,
  className = '',
  children,
  
}: UserAvatarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Вычисляем стиль с использованием пропсов
  const avatarStyle = {
    width: `${defaultWidth}px`,
    height: `${defaultHeight}px`,
  };

  return (
    <div className={`${className} ${styles.avatarContainer}`}>
      <Squircle 
        className={styles.avatar}

        style={avatarStyle}
        cornerRadius={cornerRadius}
        cornerSmoothing={cornerSmoothing}
  
        defaultWidth={defaultWidth}
        defaultHeight={defaultHeight}
        onClick={() => setIsOpen(true)}
        
        
        asChild
        
      >
        <img src={src} alt={alt} />
        
      </Squircle>
      {/*{children && <div>{children}</div>} */} {/* Вставляем children сюда */}
      {/*{children && <div className={styles.overlay}>{children}</div>} */}
      {children}
      {isOpen && (
        <div className={styles.menu}>
          {/* Settings menu content */}
        </div>
      )}
    </div>
  );
};

export default UserAvatar;