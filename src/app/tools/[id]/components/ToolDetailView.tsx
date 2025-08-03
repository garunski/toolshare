"use client";

import { useState } from "react";

import { Badge } from "@/primitives/badge";
import { Button } from "@/primitives/button";
import { Heading } from "@/primitives/heading";
import { Text } from "@/primitives/text";
import { Tool } from "@/types/tool";

import { RequestToolModal } from "./RequestToolModal";
import { ToolImageGallery } from "./ToolImageGallery";
import { ToolOwnerInfo } from "./ToolOwnerInfo";

interface ToolDetailViewProps {
  tool: Tool & {
    profiles: {
      id: string;
      first_name: string;
      last_name: string;
      bio: string | null;
    };
  };
}

export function ToolDetailView({ tool }: ToolDetailViewProps) {
  const [showRequestModal, setShowRequestModal] = useState(false);

  const isAvailable = tool.is_available;

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Tool Images */}
        <div className="space-y-4">
          <ToolImageGallery images={tool.images || []} />
        </div>

        {/* Tool Information */}
        <div className="space-y-6">
          <div>
            <Heading
              level={1}
              className="mb-2 text-3xl font-bold text-gray-900 dark:text-white"
            >
              {tool.name}
            </Heading>
            <div className="mb-4 flex items-center gap-2">
              <Badge color={isAvailable ? "green" : "zinc"}>
                {isAvailable ? "Available" : "Unavailable"}
              </Badge>
              {tool.category && <Badge color="blue">{tool.category}</Badge>}
              {tool.condition && <Badge color="amber">{tool.condition}</Badge>}
            </div>
          </div>

          {tool.description && (
            <div className="rounded-lg border border-zinc-950/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900">
              <div className="mb-4">
                <Heading level={3} className="text-lg font-semibold">
                  Description
                </Heading>
              </div>
              <div>
                <Text className="leading-relaxed text-gray-700 dark:text-gray-300">
                  {tool.description}
                </Text>
              </div>
            </div>
          )}

          <ToolOwnerInfo owner={tool.profiles} />

          <div className="pt-4">
            <Button
              onClick={() => setShowRequestModal(true)}
              disabled={!isAvailable}
              className="w-full"
            >
              {isAvailable ? "Request to Borrow" : "Currently Unavailable"}
            </Button>
          </div>
        </div>
      </div>

      <RequestToolModal
        tool={tool}
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
      />
    </div>
  );
}
