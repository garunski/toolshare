import { Heading } from "@/primitives/heading";
import { Text } from "@/primitives/text";

interface RecentActivity {
  id: string;
  name: string;
  image_url: string | null;
  created_at: string;
  profiles: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
}

interface SocialFeedProps {
  recentActivity: RecentActivity[];
}

export function SocialFeed({ recentActivity }: SocialFeedProps) {
  if (recentActivity.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <Text>No recent activity from friends.</Text>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Heading level={3} className="text-lg font-semibold">
        Recent Activity
      </Heading>
      <div className="space-y-4">
        {recentActivity.map((activity) => (
          <div
            key={activity.id}
            className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800"
          >
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-zinc-300 dark:bg-zinc-600" />
              <div className="flex-1">
                <Text className="font-medium">
                  {activity.profiles.first_name} {activity.profiles.last_name}
                </Text>
                <Text className="text-sm text-zinc-600 dark:text-zinc-400">
                  added a new tool: {activity.name}
                </Text>
                <Text className="text-xs text-zinc-500 dark:text-zinc-500">
                  {new Date(activity.created_at).toLocaleDateString()}
                </Text>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
