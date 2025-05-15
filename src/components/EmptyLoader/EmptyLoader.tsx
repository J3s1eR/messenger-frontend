import React, { useEffect, useRef } from 'react';
import { useIntersectionObserver } from './useIntersectionObserver';

interface EmptyLoaderProps {
  onVisible: () => void;
  rootMargin?: string;       // необязательный параметр
  threshold?: number;        // необязательный параметр
  callOnlyOnce?: boolean;    // необязательный параметр
}

export const EmptyLoader: React.FC<EmptyLoaderProps> = ({ 
    onVisible, 
    rootMargin = '0px 0px 0px 0px', // значение по умолчанию. top, right, bottom, left. Например '0px 0px -100px 0px' исключает 100px снизу (например, высота инпута внизу страницы)
    threshold = 1.0, // значение по умолчанию. Например 1.0 - элемент должен быть полностью видим
    callOnlyOnce = true, // значение по умолчанию. вызывать только один раз. необязательный параметр


}) => {
  const loaderRef = useRef<HTMLDivElement>(null);
  const calledRef = useRef(false); // Чтобы не вызывать onVisible много раз

  useIntersectionObserver({
    targetRef: loaderRef,
    onIntersect: () => {
        if (callOnlyOnce) {
            if (!calledRef.current) {
              calledRef.current = true;
              onVisible();
            }
        } else {
        onVisible();
        }
    },
    rootMargin,
    threshold,
  });

  return <div ref={loaderRef} style={{ height: '10px' }} />;
};