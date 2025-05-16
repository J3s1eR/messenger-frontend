import React, { useEffect, useRef } from 'react';
import { useIntersectionObserver } from './useIntersectionObserver';

interface EmptyLoaderProps {
  onVisible: () => void;
  rootMargin?: string;       // необязательный параметр
  threshold?: number;        // необязательный параметр
  callOnlyOnce?: boolean;    // необязательный параметр
  useLatestOnVisible?: boolean;   // необязательный параметр
}

export const EmptyLoader: React.FC<EmptyLoaderProps> = ({ 
    onVisible, 
    rootMargin = '0px 0px 0px 0px', // значение по умолчанию. top, right, bottom, left. Например '0px 0px -100px 0px' исключает 100px снизу (например, высота инпута внизу страницы)
    threshold = 1.0, // значение по умолчанию. Например 1.0 - элемент должен быть полностью видим
    callOnlyOnce = true, // значение по умолчанию. вызывать только один раз. необязательный параметр
    useLatestOnVisible = false // значение по умолчанию. вызывать с коллбэком, который был при первом рендере. необязательный параметр

}) => {
  const loaderRef = useRef<HTMLDivElement>(null);
  const calledRef = useRef(false); // Чтобы не вызывать onVisible много раз


    //храним актуальную версию onVisible
  const latestOnVisibleRef = useRef(onVisible);
  useEffect(() => {
    latestOnVisibleRef.current = onVisible;
  }, [onVisible]);
  //если не нужна актуальная версия, можно не использовать


  useIntersectionObserver({
    targetRef: loaderRef,
    onIntersect: () => {
         const visibleFn = useLatestOnVisible ? latestOnVisibleRef.current : onVisible;//если useLatestOnVisible true, то используем актуальный колбэка, иначе - переданный в компонент в момент первого рендера


        if (callOnlyOnce) {
            if (!calledRef.current) {
              calledRef.current = true;
              visibleFn();// вызов колбэка (либо актуального, либо переданного в компонент в момент первого рендера)
            }
        } else {
        visibleFn();// вызов колбэка (либо актуального, либо переданного в компонент в момент первого рендера)
        }
    },
    rootMargin,
    threshold,
  });

  return <div ref={loaderRef} style={{ height: '1px' }} />;
};