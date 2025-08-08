// Mobile optimization hooks
export {
  useMobileKeyboard,
  useMobileScroll,
  useMobileViewport,
} from "./useMobileOptimization";

// Touch gesture hooks
export { useTouchGestures } from "./useTouchGestures";
export {
  handleTouchEnd,
  handleTouchMove,
  handleTouchStart,
} from "./useTouchGesturesCore";
export {
  handleTouchMove as handleTouchMoveHandler,
  handleTouchStart as handleTouchStartHandler,
} from "./useTouchGesturesHandlers";
