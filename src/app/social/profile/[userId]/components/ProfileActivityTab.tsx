import { Heading } from "@/primitives/heading";
import { Text } from "@/primitives/text";

export function ProfileActivityTab() {
  return (
    <div className="mt-6">
      <div className="rounded-lg border border-zinc-950/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <div className="mb-4">
          <Heading level={3} className="text-lg font-semibold">
            Recent Activity
          </Heading>
        </div>
        <div>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <div className="flex-1">
                <Text className="font-medium text-zinc-900 dark:text-white">
                  Completed a loan
                </Text>
                <Text className="text-sm text-zinc-500 dark:text-zinc-400">
                  Successfully returned a power drill
                </Text>
              </div>
              <Text className="text-sm text-zinc-500 dark:text-zinc-400">
                2 days ago
              </Text>
            </div>
            <div className="flex items-center space-x-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              <div className="flex-1">
                <Text className="font-medium text-zinc-900 dark:text-white">
                  Added a new tool
                </Text>
                <Text className="text-sm text-zinc-500 dark:text-zinc-400">
                  Circular saw is now available
                </Text>
              </div>
              <Text className="text-sm text-zinc-500 dark:text-zinc-400">
                1 week ago
              </Text>
            </div>
            <div className="flex items-center space-x-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
              <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
              <div className="flex-1">
                <Text className="font-medium text-zinc-900 dark:text-white">
                  Received a review
                </Text>
                <Text className="text-sm text-zinc-500 dark:text-zinc-400">
                  5-star rating for excellent service
                </Text>
              </div>
              <Text className="text-sm text-zinc-500 dark:text-zinc-400">
                2 weeks ago
              </Text>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
