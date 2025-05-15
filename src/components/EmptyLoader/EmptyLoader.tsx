import React, { useEffect, useRef } from 'react';

interface EmptyLoaderProps {
  onVisible: () => void;
  rootMargin?: string;       // необязательный параметр
  threshold?: number;        // необязательный параметр
}

export const EmptyLoader: React.FC<EmptyLoaderProps> = ({ 
    onVisible, 
    rootMargin = '0px 0px 0px 0px', // значение по умолчанию. top, right, bottom, left. Например '0px 0px -100px 0px' исключает 100px снизу (например, высота инпута внизу страницы)
    threshold = 1.0 // значение по умолчанию. Например 1.0 - элемент должен быть полностью видим

}) => {
  const ref = useRef<HTMLDivElement>(null);
  const calledRef = useRef(false); // Чтобы не вызывать onVisible много раз

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !calledRef.current) {
          calledRef.current = true;
          onVisible();
        }
      },
      {
        root: null,
        rootMargin,
        threshold,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  return <div ref={ref} style={{ height: '10px' }} />;
};