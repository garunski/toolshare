"use client";

import { ProfileActions } from "./components/ProfileActions";
import { ProfileCard } from "./components/ProfileCard";
import { ProfileDataLoader } from "./components/ProfileDataLoader";
import { ProfileStats } from "./components/ProfileStats";
import { ProfileTabs } from "./components/ProfileTabs";
import { useProfileLogic } from "./hooks/useProfileLogic";

export default function UserProfilePage() {
  const {
    profile,
    socialStats,
    friendshipStatus,
    loading,
    sendingRequest,
    userId,
    isOwnProfile,
    handleDataLoaded,
    handleSendFriendRequest,
    handleAcceptRequest,
    handleRejectRequest,
    handleMessage,
    setLoading,
  } = useProfileLogic();

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-lg">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-6">
        <div className="py-8 text-center">
          <h1 className="mb-2 text-2xl font-bold">User Not Found</h1>
          <p className="text-muted-foreground">
            The user you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <ProfileDataLoader
        userId={userId}
        onDataLoaded={handleDataLoaded}
        onLoadingChange={setLoading}
        onError={(error) => console.error(error)}
      />

      <ProfileActions
        isOwnProfile={isOwnProfile}
        friendshipStatus={friendshipStatus}
        sendingRequest={sendingRequest}
        onSendFriendRequest={handleSendFriendRequest}
        onAcceptRequest={handleAcceptRequest}
        onRejectRequest={handleRejectRequest}
        onMessage={handleMessage}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <ProfileCard
            profile={profile}
            isOwnProfile={isOwnProfile}
            friendshipStatus={friendshipStatus}
            sendingRequest={sendingRequest}
            onSendFriendRequest={handleSendFriendRequest}
            onAcceptRequest={handleAcceptRequest}
            onRejectRequest={handleRejectRequest}
            onMessage={handleMessage}
          />
        </div>

        <div className="lg:col-span-2">
          {socialStats && <ProfileStats socialStats={socialStats} />}
          <ProfileTabs />
        </div>
      </div>
    </div>
  );
}
