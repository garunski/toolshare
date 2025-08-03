"use client";

import type { Database } from "@/types/supabase";

import { ToolCard } from "./ToolCard";

type Tool = Database["public"]["Tables"]["tools"]["Row"] & {
  profiles: {
    id: string;
    first_name: string;
    last_name: string;
  };
};

interface ToolGridProps {
  tools: Tool[];
}

export function ToolGrid({ tools }: ToolGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {tools.map((tool) => (
        <ToolCard key={tool.id} tool={tool} />
      ))}
    </div>
  );
}
