import { handleTouchMove, handleTouchStart } from "./useTouchGesturesHandlers";

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
 * Handle touch end event
 */
export function handleTouchEnd(
  event: TouchEvent,
  options: TouchGestureOptions,
  touchState: TouchState,
  lastTapTime: { current: number },
) {
  // Clear long press timer
  if (touchState.longPressTimer) {
    clearTimeout(touchState.longPressTimer);
  }

  if (touchState.isLongPress) {
    return; // Don't process other gestures if long press occurred
  }

  const touch = event.changedTouches[0];
  const deltaX = touch.clientX - touchState.startX;
  const deltaY = touch.clientY - touchState.startY;
  const deltaTime = Date.now() - touchState.startTime;

  const maxSwipeTime = options.maxSwipeTime || 300;
  const minSwipeDistance = options.minSwipeDistance || 50;
  const doubleTapDelay = 300;

  // Check if it's a swipe
  if (deltaTime <= maxSwipeTime) {
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    if (absDeltaX > minSwipeDistance || absDeltaY > minSwipeDistance) {
      if (absDeltaX > absDeltaY) {
        // Horizontal swipe
        if (deltaX > 0 && options.onSwipeRight) {
          options.onSwipeRight();
        } else if (deltaX < 0 && options.onSwipeLeft) {
          options.onSwipeLeft();
        }
      } else {
        // Vertical swipe
        if (deltaY > 0 && options.onSwipeDown) {
          options.onSwipeDown();
        } else if (deltaY < 0 && options.onSwipeUp) {
          options.onSwipeUp();
        }
      }
      return;
    }
  }

  // Check if it's a tap
  if (deltaTime <= 200 && Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
    const now = Date.now();
    if (now - lastTapTime.current < doubleTapDelay) {
      // Double tap
      if (options.onDoubleTap) {
        options.onDoubleTap();
      }
      lastTapTime.current = 0;
    } else {
      // Single tap
      if (options.onTap) {
        options.onTap();
      }
      lastTapTime.current = now;
    }
  }
}

// Re-export handlers for convenience
export { handleTouchMove, handleTouchStart };
