import { useCallback, useEffect, useRef, useState } from "react";

import {
  handleTouchEnd,
  handleTouchMove,
  handleTouchStart,
} from "./useTouchGesturesCore";

interface TouchGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinch?: (scale: number) => void;
  onTap?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  minSwipeDistance?: number;
  maxSwipeTime?: number;
  longPressDelay?: number;
}

interface TouchState {
  startX: number;
  startY: number;
  startTime: number;
  isLongPress: boolean;
  longPressTimer?: NodeJS.Timeout;
}

export function useTouchGestures(options: TouchGestureOptions = {}) {
  const [touchState, setTouchState] = useState<TouchState>({
    startX: 0,
    startY: 0,
    startTime: 0,
    isLongPress: false,
  });

  const elementRef = useRef<HTMLElement>(null);
  const lastTapTime = useRef(0);

  const handleTouchStartCallback = useCallback(
    (event: TouchEvent) => {
      handleTouchStart(event, options, setTouchState);
    },
    [options],
  );

  const handleTouchMoveCallback = useCallback(
    (event: TouchEvent) => {
      handleTouchMove(event, options, touchState, setTouchState);
    },
    [options, touchState],
  );

  const handleTouchEndCallback = useCallback(
    (event: TouchEvent) => {
      handleTouchEnd(event, options, touchState, lastTapTime);
    },
    [options, touchState],
  );

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener("touchstart", handleTouchStartCallback, {
      passive: false,
    });
    element.addEventListener("touchmove", handleTouchMoveCallback, {
      passive: false,
    });
    element.addEventListener("touchend", handleTouchEndCallback, {
      passive: false,
    });

    return () => {
      element.removeEventListener("touchstart", handleTouchStartCallback);
      element.removeEventListener("touchmove", handleTouchMoveCallback);
      element.removeEventListener("touchend", handleTouchEndCallback);
    };
  }, [
    handleTouchStartCallback,
    handleTouchMoveCallback,
    handleTouchEndCallback,
  ]);

  return { elementRef };
}
