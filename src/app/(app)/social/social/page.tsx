import { SocialHeader } from "./components/SocialHeader";
import { SocialTabsWrapper } from "./components/SocialTabsWrapper";
import { getSocialFeedData } from "./getSocialFeedData";

export default async function SocialPage() {
  const { friends, friendRequests, suggestedFriends, recentActivity } =
    await getSocialFeedData();

  return (
    <div className="container mx-auto max-w-6xl p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
          Social
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Connect with friends and discover new people
        </p>
      </div>

      <div className="space-y-6">
        <SocialHeader socialStats={null} />
        <SocialTabsWrapper
          friends={friends}
          friendRequests={friendRequests}
          suggestedFriends={suggestedFriends}
          recentActivity={recentActivity}
        />
      </div>
    </div>
  );
}
