"use client";

import Image from "next/image";
import Link from "next/link";

import {
  formatAvailabilityStatus,
  getAvailabilityBadgeVariant,
} from "@/common/formatters/availabilityStatusFormatter";
import { Badge } from "@/primitives/badge";
import { Button } from "@/primitives/button";
import { Heading } from "@/primitives/heading";
import { Text } from "@/primitives/text";
import type { Database } from "@/types/supabase";

type Tool = Database["public"]["Tables"]["tools"]["Row"] & {
  profiles: {
    id: string;
    first_name: string;
    last_name: string;
  };
};

interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleDateString();
  };

  const getConditionColor = (condition: string | null) => {
    switch (condition) {
      case "excellent":
        return "bg-green-100 text-green-800";
      case "good":
        return "bg-blue-100 text-blue-800";
      case "fair":
        return "bg-yellow-100 text-yellow-800";
      case "poor":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="rounded-lg border border-zinc-950/10 bg-white shadow-sm transition-shadow hover:shadow-lg dark:border-white/10 dark:bg-zinc-900">
      {/* Tool Image */}
      {tool.images && tool.images.length > 0 ? (
        <div className="relative aspect-video overflow-hidden rounded-t-lg">
          <Image
            src={tool.images[0]}
            alt={tool.name}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="flex aspect-video items-center justify-center rounded-t-lg bg-gray-200 dark:bg-zinc-800">
          <div className="text-center text-gray-400 dark:text-zinc-500">
            <div className="mb-2 text-4xl">🔧</div>
            <div className="text-sm">No image</div>
          </div>
        </div>
      )}

      <div className="p-4">
        <div className="mb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Heading level={3} className="line-clamp-1 text-lg">
                {tool.name}
              </Heading>
              <Text className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {tool.category}
              </Text>
            </div>
            <Badge
              color={
                getAvailabilityBadgeVariant(
                  formatAvailabilityStatus(tool.is_available ?? false).status,
                ) as any
              }
            >
              {formatAvailabilityStatus(tool.is_available ?? false).label}
            </Badge>
          </div>
        </div>

        <div className="space-y-3">
          {/* Description */}
          <Text className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
            {tool.description}
          </Text>

          {/* Condition */}
          {tool.condition && (
            <div className="flex items-center gap-2">
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                Condition:
              </Text>
              <span
                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getConditionColor(
                  tool.condition,
                )}`}
              >
                {tool.condition}
              </span>
            </div>
          )}

          {/* Owner */}
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>
              Owner: {tool.profiles.first_name} {tool.profiles.last_name}
            </span>
            <span>Added {formatDate(tool.created_at)}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Link href={`/tools/${tool.id}`} className="flex-1">
              <Button outline className="w-full">
                View Details
              </Button>
            </Link>
            <Link href={`/tools/${tool.id}/request`} className="flex-1">
              <Button className="w-full">Request</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
