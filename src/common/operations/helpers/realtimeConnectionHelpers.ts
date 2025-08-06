// Re-export all helper classes for backward compatibility
export { AdminSubscriptionHelpers } from "./adminSubscriptionHelpers";
export { ConnectionManagementHelpers } from "./connectionManagementHelpers";
export { UserSubscriptionHelpers } from "./userSubscriptionHelpers";

// Import the classes for the legacy export
import { AdminSubscriptionHelpers } from "./adminSubscriptionHelpers";
import { ConnectionManagementHelpers } from "./connectionManagementHelpers";
import { UserSubscriptionHelpers } from "./userSubscriptionHelpers";

// Legacy exports for backward compatibility
export const RealtimeConnectionHelpers = {
  ...AdminSubscriptionHelpers,
  ...UserSubscriptionHelpers,
  ...ConnectionManagementHelpers,
};
