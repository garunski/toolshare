import { useEffect, useRef, useState } from "react";

interface LazyLoadOptions {
  rootMargin?: string;
  threshold?: number;
  triggerOnce?: boolean;
}

export function useLazyLoading(options: LazyLoadOptions = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  const { rootMargin = "50px", threshold = 0.1, triggerOnce = true } = options;

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    if (triggerOnce && hasTriggered) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting;
        setIsIntersecting(isVisible);

        if (isVisible && triggerOnce) {
          setHasTriggered(true);
        }
      },
      {
        rootMargin,
        threshold,
      },
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [rootMargin, threshold, triggerOnce, hasTriggered]);

  return {
    elementRef,
    isIntersecting,
    hasTriggered,
  };
}

export function useLazyData<T>(
  loadData: () => Promise<T>,
  options: LazyLoadOptions = {},
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { elementRef, isIntersecting, hasTriggered } = useLazyLoading(options);

  useEffect(() => {
    if (isIntersecting && !hasTriggered && !loading && !data) {
      setLoading(true);
      setError(null);

      loadData()
        .then(setData)
        .catch(setError)
        .finally(() => setLoading(false));
    }
  }, [isIntersecting, hasTriggered, loading, data, loadData]);

  return {
    elementRef,
    data,
    loading,
    error,
    isVisible: isIntersecting,
  };
}
