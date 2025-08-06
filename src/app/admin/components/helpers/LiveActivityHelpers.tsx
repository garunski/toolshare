import {
  ArrowRightIcon,
  ChatBubbleLeftIcon,
  ClockIcon,
  PlusIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";

import { Avatar } from "@/primitives/avatar";
import { Badge } from "@/primitives/badge";

interface ActivityItem {
  id: string;
  type: "user_joined" | "item_added" | "loan_requested" | "message_sent";
  user_name: string;
  user_avatar?: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export class LiveActivityHelpers {
  static getActivityIcon(type: string) {
    switch (type) {
      case "user_joined":
        return <UserPlusIcon className="h-4 w-4" />;
      case "item_added":
        return <PlusIcon className="h-4 w-4" />;
      case "loan_requested":
        return <ArrowRightIcon className="h-4 w-4" />;
      case "message_sent":
        return <ChatBubbleLeftIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  }

  static getActivityColor(type: string) {
    switch (type) {
      case "user_joined":
        return "text-green-600 bg-green-100";
      case "item_added":
        return "text-blue-600 bg-blue-100";
      case "loan_requested":
        return "text-purple-600 bg-purple-100";
      case "message_sent":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  }

  static formatTimestamp(timestamp: string) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  }

  static ActivityItem({ activity }: { activity: ActivityItem }) {
    return (
      <div className="flex items-start space-x-3 rounded-lg p-3 hover:bg-gray-50">
        <Avatar
          src={activity.user_avatar}
          alt={activity.user_name}
          className="h-8 w-8"
        />

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center space-x-2">
            <span className="truncate font-medium text-gray-900">
              {activity.user_name}
            </span>
            <Badge className={this.getActivityColor(activity.type)}>
              {this.getActivityIcon(activity.type)}
            </Badge>
          </div>

          <p className="mb-1 text-sm text-gray-600">{activity.description}</p>

          <p className="text-xs text-gray-500">
            {this.formatTimestamp(activity.timestamp)}
          </p>
        </div>
      </div>
    );
  }
}
