export type AvailabilityStatus =
  | "available"
  | "unavailable"
  | "borrowed"
  | "pending";

export interface AvailabilityInfo {
  status: AvailabilityStatus;
  label: string;
  description: string;
  color: "green" | "red" | "yellow" | "gray";
  icon: string;
}

export function formatAvailabilityStatus(
  isAvailable: boolean,
  loanStatus?: string,
): AvailabilityInfo {
  if (!isAvailable) {
    if (loanStatus === "pending") {
      return {
        status: "pending",
        label: "Request Pending",
        description: "A borrowing request is being reviewed",
        color: "yellow",
        icon: "⏳",
      };
    } else {
      return {
        status: "borrowed",
        label: "Currently Borrowed",
        description: "This tool is currently being used by someone else",
        color: "red",
        icon: "🔒",
      };
    }
  }

  return {
    status: "available",
    label: "Available",
    description: "This tool is ready to borrow",
    color: "green",
    icon: "✅",
  };
}

export function getAvailabilityBadgeVariant(
  status: AvailabilityStatus,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "available":
      return "default";
    case "pending":
      return "secondary";
    case "borrowed":
    case "unavailable":
      return "destructive";
    default:
      return "outline";
  }
}

export function formatAvailabilityMessage(
  status: AvailabilityStatus,
  toolName: string,
): string {
  switch (status) {
    case "available":
      return `${toolName} is available for borrowing`;
    case "pending":
      return `A request for ${toolName} is being reviewed`;
    case "borrowed":
      return `${toolName} is currently being borrowed`;
    case "unavailable":
      return `${toolName} is temporarily unavailable`;
    default:
      return `${toolName} availability unknown`;
  }
}

export function getNextAvailableDate(loanEndDate?: string): string | null {
  if (!loanEndDate) return null;

  const endDate = new Date(loanEndDate);
  const now = new Date();

  if (endDate <= now) return null;

  return endDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatTimeUntilAvailable(loanEndDate?: string): string | null {
  if (!loanEndDate) return null;

  const endDate = new Date(loanEndDate);
  const now = new Date();

  if (endDate <= now) return null;

  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return "Available tomorrow";
  } else if (diffDays <= 7) {
    return `Available in ${diffDays} days`;
  } else {
    const diffWeeks = Math.ceil(diffDays / 7);
    return `Available in ${diffWeeks} week${diffWeeks > 1 ? "s" : ""}`;
  }
}
