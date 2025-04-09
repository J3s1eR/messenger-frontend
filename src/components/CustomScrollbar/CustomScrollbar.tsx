import React, { useState, useRef, useEffect } from 'react';
import styles from './CustomScrollbar.module.css';

type CustomScrollbarProps = {
  children: React.ReactNode;
  className?: string; // Добавляем поддержку className
};

export const CustomScrollbar = ({ children , className }: CustomScrollbarProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollPercent, setScrollPercent] = useState(0);
  const [isScrollbarVisible, setIsScrollbarVisible] = useState(true); // Состояние видимости скроллбара

  // Функция для обновления состояния прокрутки
  const updateScrollState = () => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;

    // Проверка, нужно ли показывать скроллбар
    const shouldShowScrollbar = scrollHeight > clientHeight;
    setIsScrollbarVisible(shouldShowScrollbar);

    if (shouldShowScrollbar) {
      // Вычисляем позицию бегунка в процентах
      const thumbPositionPercent = (scrollTop / (scrollHeight - clientHeight)) * 100;
      setScrollPercent(thumbPositionPercent);
    }
  };

  useEffect(() => {
    // Первичная инициализация
    const handleResizeOrContentChange = () => {
      setTimeout(() => {
        updateScrollState();
      }, 0);
    };

    // Обработчики событий
    const handleScroll = () => {
      updateScrollState();
    };

    const container = containerRef.current;

    // Добавляем слушатели
    container?.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResizeOrContentChange);

    // Первоначальное обновление
    handleResizeOrContentChange();

    return () => {
      container?.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResizeOrContentChange);
    };
  }, []);

  const handleThumbDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;

    const { clientHeight, scrollHeight } = containerRef.current;
    const thumbHeight = (clientHeight / scrollHeight) * clientHeight;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return;

      const offsetY = moveEvent.clientY - containerRect.top;
      const newScrollTop = ((offsetY - thumbHeight / 2) / clientHeight) * scrollHeight;

      // Ограничиваем scrollTop в пределах допустимых значений
      containerRef.current!.scrollTop = Math.max(0, Math.min(newScrollTop, scrollHeight - clientHeight));
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div className={` ${styles.scrollContainer} ${className || ''}`}>
      <div className={styles.content} ref={containerRef}>
        {children}
      </div>
      <div
        className={styles.scrollbarTrack}
        style={{
          display: isScrollbarVisible ? 'block' : 'none', // Управление видимостью трека
        }}
      >
        <div
          className={styles.scrollbarThumb}
          style={{
            height: `${Math.max(
              ((containerRef.current?.clientHeight || 0) /
                (containerRef.current?.scrollHeight || 1)) *
                100,
              10
            )}%`,
            transform: `translateY(${scrollPercent}%)`,
          }}
          onMouseDown={handleThumbDrag}
        />
      </div>
    </div>
  );
};