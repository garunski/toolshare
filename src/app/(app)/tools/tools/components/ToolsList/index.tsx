import Link from "next/link";

import { Button } from "@/primitives/button";
import { Text } from "@/primitives/text";

interface Tool {
  id: string;
  name: string;
  description: string;
  condition: string;
  is_available: boolean;
  categories: {
    name: string;
    slug: string;
  };
  profiles: {
    name: string;
    avatar_url: string;
  };
}

interface ToolsListProps {
  tools: Tool[];
}

export function ToolsList({ tools }: ToolsListProps) {
  if (tools.length === 0) {
    return (
      <div className="py-12 text-center">
        <h3 className="mb-4 text-lg font-medium text-gray-900">No tools yet</h3>
        <p className="mb-6 text-gray-600">
          Start sharing your tools with the community!
        </p>
        <Link href="/tools/add">
          <Button>Add Your First Tool</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {tools.map((tool) => (
        <div
          key={tool.id}
          className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div>
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              {tool.name}
            </h3>
            <Text className="mb-4 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
              {tool.description}
            </Text>
            <div className="mb-4">
              <span className="text-sm text-gray-500 capitalize dark:text-gray-400">
                {tool.categories?.name}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  tool.is_available
                    ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                }`}
              >
                {tool.is_available ? "Available" : "Unavailable"}
              </span>
              <span className="text-sm text-gray-500 capitalize dark:text-gray-400">
                {tool.condition}
              </span>
            </div>
            <div className="mt-4 flex gap-2">
              <Link href={`/tools/${tool.id}`} className="flex-1">
                <Button outline className="w-full">
                  View Details
                </Button>
              </Link>
              <Link href={`/tools/${tool.id}/edit`} className="flex-1">
                <Button outline className="w-full">
                  Edit
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
