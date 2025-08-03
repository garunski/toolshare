import { Avatar } from "@/primitives/avatar";
import { Heading } from "@/primitives/heading";
import { Text } from "@/primitives/text";

export function ProfileReviewsTab() {
  return (
    <div className="mt-6">
      <div className="rounded-lg border border-zinc-950/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <div className="mb-4">
          <Heading level={3} className="text-lg font-semibold">
            Reviews &amp; Ratings
          </Heading>
        </div>
        <div>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
              <Avatar initials="JD" />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <Text className="font-medium text-zinc-900 dark:text-white">
                    Jane Doe
                  </Text>
                  <div className="flex text-yellow-400">{"★".repeat(5)}</div>
                </div>
                <Text className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  &ldquo;Excellent service! The tool was in perfect condition
                  and John was very helpful with setup instructions.&rdquo;
                </Text>
                <Text className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                  3 days ago
                </Text>
              </div>
            </div>
            <div className="flex items-start space-x-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
              <Avatar initials="MS" />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <Text className="font-medium text-zinc-900 dark:text-white">
                    Mike Smith
                  </Text>
                  <div className="flex text-yellow-400">{"★".repeat(4)}</div>
                </div>
                <Text className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  &ldquo;Great experience borrowing tools. Everything was as
                  described and communication was clear.&rdquo;
                </Text>
                <Text className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                  1 week ago
                </Text>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
