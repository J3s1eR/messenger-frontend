import React, { useState, useRef, useEffect } from 'react';
import styles from './ResizablePanel.module.css';

interface ResizablePanelProps {
  children: React.ReactNode;
  initialWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  onResize?: (width: number) => void;
  resizerPosition?: 'left' | 'right';
  className?: string;
}

export const ResizablePanel: React.FC<ResizablePanelProps> = ({
  children,
  initialWidth,
  minWidth = 400,
  maxWidth = 800,
  onResize,
  resizerPosition = 'right',
  className = '',
}) => {
  const [width, setWidth] = useState(initialWidth || minWidth);
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const startResizing = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const stopResizing = () => {
    setIsResizing(false);
  };

  const resize = (e: MouseEvent) => {
    if (!isResizing || !panelRef.current) return;

    const containerRect = panelRef.current.parentElement?.getBoundingClientRect();
    if (!containerRect) return;

    let newWidth;
    if (resizerPosition === 'right') {
      newWidth = e.clientX - containerRect.left;
    } else {
      newWidth = containerRect.right - e.clientX;
    }

    // Ограничиваем ширину минимальным и максимальным значениями
    newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
    
    setWidth(newWidth);
    onResize?.(newWidth);
  };

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    }

    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing]);

  return (
    <div 
      ref={panelRef}
      className={`${styles.resizablePanel} ${className}`}
      style={{ width: `${width}px` }}
    >
        <div 
            className={`${styles.resizer} ${styles[resizerPosition]}`}
            onMouseDown={startResizing}
        />
        {children}
    </div>
  );
}; 