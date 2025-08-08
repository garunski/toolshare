import { useCallback } from "react";

export type FriendshipStatus =
  | "none"
  | "friends"
  | "pending_sent"
  | "pending_received";

export interface ProfileActionHandlers {
  onSendFriendRequest: () => Promise<void>;
  onAcceptRequest: () => Promise<void>;
  onRejectRequest: () => Promise<void>;
  onMessage: () => void;
}

export interface UseProfileActionsProps {
  isOwnProfile: boolean;
  friendshipStatus: FriendshipStatus;
  sendingRequest: boolean;
  handlers: ProfileActionHandlers;
}

export interface ProfileActionConfig {
  showActions: boolean;
  actionType:
    | "none"
    | "send_request"
    | "pending_sent"
    | "pending_received"
    | "friends";
  buttonText: string;
  isDisabled: boolean;
  showAcceptReject: boolean;
  handleAction: () => void;
  handleAccept: () => void;
  handleReject: () => void;
}

export const useProfileActions = ({
  isOwnProfile,
  friendshipStatus,
  sendingRequest,
  handlers,
}: UseProfileActionsProps): ProfileActionConfig => {
  const getActionConfig = useCallback((): Omit<
    ProfileActionConfig,
    "handleAction" | "handleAccept" | "handleReject"
  > => {
    if (isOwnProfile) {
      return {
        showActions: false,
        actionType: "none",
        buttonText: "",
        isDisabled: false,
        showAcceptReject: false,
      };
    }

    switch (friendshipStatus) {
      case "none":
        return {
          showActions: true,
          actionType: "send_request",
          buttonText: sendingRequest ? "Sending..." : "Send Friend Request",
          isDisabled: sendingRequest,
          showAcceptReject: false,
        };
      case "pending_sent":
        return {
          showActions: true,
          actionType: "pending_sent",
          buttonText: "Friend request sent",
          isDisabled: true,
          showAcceptReject: false,
        };
      case "pending_received":
        return {
          showActions: true,
          actionType: "pending_received",
          buttonText: "",
          isDisabled: false,
          showAcceptReject: true,
        };
      case "friends":
        return {
          showActions: true,
          actionType: "friends",
          buttonText: "Send Message",
          isDisabled: false,
          showAcceptReject: false,
        };
      default:
        return {
          showActions: false,
          actionType: "none",
          buttonText: "",
          isDisabled: false,
          showAcceptReject: false,
        };
    }
  }, [isOwnProfile, friendshipStatus, sendingRequest]);

  const handleAction = useCallback(() => {
    const config = getActionConfig();

    switch (config.actionType) {
      case "send_request":
        handlers.onSendFriendRequest();
        break;
      case "friends":
        handlers.onMessage();
        break;
      default:
        break;
    }
  }, [getActionConfig, handlers]);

  const handleAccept = useCallback(() => {
    handlers.onAcceptRequest();
  }, [handlers]);

  const handleReject = useCallback(() => {
    handlers.onRejectRequest();
  }, [handlers]);

  const baseConfig = getActionConfig();
  return {
    ...baseConfig,
    handleAction,
    handleAccept,
    handleReject,
  };
};
