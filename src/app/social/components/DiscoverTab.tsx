"use client";

import { Avatar } from "@/primitives/avatar";
import { Button } from "@/primitives/button";
import { Heading } from "@/primitives/heading";
import { Text } from "@/primitives/text";

import type { SocialProfile } from "../../../types/social";

interface DiscoverTabProps {
  suggestedFriends: SocialProfile[];
}

export function DiscoverTab({ suggestedFriends }: DiscoverTabProps) {
  return (
    <div className="rounded-lg border border-zinc-950/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900">
      <div className="mb-4">
        <Heading level={3} className="text-lg font-semibold">
          Suggested Friends
        </Heading>
      </div>
      <div>
        {suggestedFriends.length === 0 ? (
          <div className="py-8 text-center text-zinc-500 dark:text-zinc-400">
            <Text>No suggestions available at the moment</Text>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {suggestedFriends.map((friend) => (
              <div
                key={friend.id}
                className="rounded-lg border border-zinc-950/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900"
              >
                <div className="flex items-center space-x-3">
                  <Avatar
                    initials={`${friend.first_name[0]}${friend.last_name[0]}`}
                  />
                  <div className="flex-1">
                    <Text className="font-medium text-zinc-900 dark:text-white">
                      {friend.first_name} {friend.last_name}
                    </Text>
                    {friend.bio && (
                      <Text className="truncate text-sm text-zinc-500 dark:text-zinc-400">
                        {friend.bio}
                      </Text>
                    )}
                  </div>
                  <Button>Add Friend</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
