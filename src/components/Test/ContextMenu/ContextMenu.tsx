import { useState } from "react";
import styles from "./ContextMenu.module.css";

type ContextMenuProps = {
  items: { label: string; action: () => void }[];
};

const ContextMenu = ({ items }: ContextMenuProps) => {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault(); // Отключаем стандартное меню браузера
    setPosition({ x: event.clientX, y: event.clientY });
  };

  const handleClick = () => {
    setPosition(null); // Закрываем меню при клике в любое другое место
  };

  return (
    <div onContextMenu={handleContextMenu} onClick={handleClick} className={styles.container}>
      <p>Правый клик для вызова контекстного меню</p>
      {position && (
        <ul className={styles.menu} style={{ top: position.y, left: position.x }}>
          {items.map((item, index) => (
            <li key={index} onClick={item.action}>
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ContextMenu;