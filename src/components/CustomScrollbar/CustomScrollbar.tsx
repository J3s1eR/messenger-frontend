import React, { useState, useRef, useEffect } from 'react';
import styles from './CustomScrollbar.module.css';

type CustomScrollbarProps = {
  children: React.ReactNode;
  className?: string; // Добавляем поддержку className
};

export const CustomScrollbar = ({ children, className }: CustomScrollbarProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollPercent, setScrollPercent] = useState(0);
  const [isScrollbarVisible, setIsScrollbarVisible] = useState(false); // Показывает, нужно ли показывать скроллбар
  const [thumbHeight, setThumbHeight] = useState(20); // Высота бегунка

  // Обновление состояния скроллбара
  const updateScrollState = () => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;

    // Проверка, нужно ли показывать скроллбар
    const shouldShowScrollbar = scrollHeight > clientHeight;
    setIsScrollbarVisible(shouldShowScrollbar);

    // Расчет высоты бегунка
    const height = Math.max((clientHeight / scrollHeight) * 100, 10);
    setThumbHeight(height);

    // Расчет позиции бегунка с учетом максимально возможной прокрутки
    if (scrollHeight > clientHeight) {
      const maxScroll = scrollHeight - clientHeight;
      const percent = (scrollTop / maxScroll) * (100 - height);
      setScrollPercent(percent);
    } else {
      setScrollPercent(0);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      updateScrollState();
    };

    // Первоначальное обновление и настройка слушателей
    updateScrollState();
    container.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', updateScrollState);

    // Наблюдатель за изменениями содержимого
    const observer = new MutationObserver(updateScrollState);
    observer.observe(container, { 
      childList: true, 
      subtree: true,
      attributes: true
    });

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateScrollState);
      observer.disconnect();
    };
  }, []);

  // Обработчик перетаскивания бегунка
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;

    const container = containerRef.current;
    const { scrollHeight, clientHeight } = container;
    
    // Начальные координаты
    const startY = e.clientY;
    const startScrollTop = container.scrollTop;
    
    // Расчет максимальной прокрутки
    const maxScroll = scrollHeight - clientHeight;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      // Смещение указателя мыши
      const deltaY = moveEvent.clientY - startY;
      
      // Используем более чувствительный коэффициент прокрутки
      // Вместо clientHeight используем меньшее значение для увеличения скорости прокрутки
      const scrollRatio = deltaY / (clientHeight * 0.5);
      
      // Расчет новой позиции прокрутки
      const newScrollTop = startScrollTop + (scrollRatio * maxScroll);
      
      // Применение новой позиции прокрутки с ограничениями
      container.scrollTop = Math.max(0, Math.min(newScrollTop, maxScroll));
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Обработчик клика по треку скроллбара
  const handleTrackClick = (e: React.MouseEvent) => {
    if (!containerRef.current || !e.currentTarget) return;
    
    const container = containerRef.current;
    const { clientHeight, scrollHeight } = container;
    const trackRect = e.currentTarget.getBoundingClientRect();
    
    // Расчет позиции клика относительно трека (от 0 до 1)
    const clickPositionRatio = (e.clientY - trackRect.top) / trackRect.height;
    
    // Преобразование позиции клика в позицию прокрутки
    // Учитываем высоту бегунка при расчете для более точного позиционирования
    const effectiveHeight = thumbHeight / 100;
    const adjustedRatio = Math.max(0, Math.min(1, 
      clickPositionRatio - effectiveHeight/2) / (1 - effectiveHeight)
    );
    
    container.scrollTop = adjustedRatio * (scrollHeight - clientHeight);
  };

  return (
    <div className={`${styles.scrollContainer} ${className || ''}`}>
      <div className={styles.content} ref={containerRef}>
        {children}
      </div>
      {isScrollbarVisible && (
        <div 
          className={styles.scrollbarTrack}
          onClick={handleTrackClick}
        >
          <div
            className={styles.scrollbarThumb}
            style={{
              height: `${thumbHeight}%`,
              top: `${scrollPercent}%`
            }}
            onMouseDown={handleMouseDown}
          />
        </div>
      )}
    </div>
  );
};