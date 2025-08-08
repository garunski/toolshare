import { Button } from "@/primitives/button";
import { Heading } from "@/primitives/heading";
import { Text } from "@/primitives/text";

interface Friend {
  friend_id: string;
  profiles: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
    bio: string | null;
  };
}

interface FriendsListProps {
  friends: Friend[];
}

export function FriendsList({ friends }: FriendsListProps) {
  if (friends.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <Text>No friends found.</Text>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Heading level={3} className="text-lg font-semibold">
        Your Friends ({friends.length})
      </Heading>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {friends.map((friend) => (
          <div
            key={friend.friend_id}
            className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800"
          >
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-zinc-300 dark:bg-zinc-600" />
              <div className="flex-1">
                <Text className="font-medium">
                  {friend.profiles.first_name} {friend.profiles.last_name}
                </Text>
                <Text className="text-sm text-zinc-600 dark:text-zinc-400">
                  {friend.profiles.bio || "No bio available"}
                </Text>
              </div>
            </div>
            <div className="mt-3">
              <Button outline className="w-full">
                View Profile
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
