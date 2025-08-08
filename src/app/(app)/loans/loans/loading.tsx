import { Heading } from "@/primitives/heading";
import { Text } from "@/primitives/text";

export default function LoansLoading() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <Heading
          level={1}
          className="mb-2 text-3xl font-bold text-gray-900 dark:text-white"
        >
          My Loans
        </Heading>
        <Text className="text-gray-600 dark:text-gray-400">
          Manage your borrowing and lending activity
        </Text>
      </div>

      <div className="animate-pulse">
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="h-24 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-24 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-24 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
        </div>

        <div className="mb-4 flex space-x-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
          <div className="flex-1 rounded-md bg-white px-3 py-2 dark:bg-zinc-700"></div>
          <div className="flex-1 rounded-md px-3 py-2"></div>
          <div className="flex-1 rounded-md px-3 py-2"></div>
        </div>

        <div className="space-y-4">
          <div className="h-20 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-20 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-20 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
        </div>
      </div>
    </div>
  );
}
