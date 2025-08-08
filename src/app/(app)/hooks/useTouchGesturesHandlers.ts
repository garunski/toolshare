interface TouchState {
  startX: number;
  startY: number;
  startTime: number;
  isLongPress: boolean;
  longPressTimer?: NodeJS.Timeout;
}

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

/**
 * Handle touch start event
 */
export function handleTouchStart(
  event: TouchEvent,
  options: TouchGestureOptions,
  setTouchState: (
    state: TouchState | ((prev: TouchState) => TouchState),
  ) => void,
) {
  const touch = event.touches[0];
  const now = Date.now();

  const newState: TouchState = {
    startX: touch.clientX,
    startY: touch.clientY,
    startTime: now,
    isLongPress: false,
  };

  // Start long press timer
  if (options.onLongPress) {
    const longPressTimer = setTimeout(() => {
      setTouchState((prev: TouchState) => ({ ...prev, isLongPress: true }));
      options.onLongPress?.();
    }, options.longPressDelay || 500);

    newState.longPressTimer = longPressTimer;
  }

  setTouchState(newState);
}

/**
 * Handle touch move event
 */
export function handleTouchMove(
  event: TouchEvent,
  options: TouchGestureOptions,
  touchState: TouchState,
  setTouchState: (
    state: TouchState | ((prev: TouchState) => TouchState),
  ) => void,
) {
  // Cancel long press if user moves finger
  if (touchState.longPressTimer) {
    clearTimeout(touchState.longPressTimer);
    setTouchState((prev: TouchState) => ({
      ...prev,
      longPressTimer: undefined,
    }));
  }

  // Handle pinch gesture
  if (options.onPinch && event.touches.length === 2) {
    const touch1 = event.touches[0];
    const touch2 = event.touches[1];
    const distance = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY,
    );
    options.onPinch(distance);
  }
}
