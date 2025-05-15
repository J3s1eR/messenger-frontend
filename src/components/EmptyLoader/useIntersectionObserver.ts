import { useEffect } from "react";

export function useIntersectionObserver({
  targetRef,
  onIntersect,
  root = null,
  rootMargin = "0px",
  threshold = 0,
  enabled = true,
}: {
  targetRef: React.RefObject<HTMLElement | null>;
  onIntersect: () => void;
  root?: Element | null;
  rootMargin?: string;
  threshold?: number;
  enabled?: boolean;
}) {
  useEffect(() => {
    if (!enabled) return;

    const node = targetRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onIntersect();
      },
      {
        root,
        rootMargin,
        threshold,
      }
    );

    observer.observe(node);

    return () => {
      observer.unobserve(node);
      observer.disconnect();
    };
  }, [targetRef.current, enabled, rootMargin, threshold]);
}
