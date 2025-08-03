"use client";

import { X } from "lucide-react";

import { Button } from "@/primitives/button";
import { Heading } from "@/primitives/heading";
import { Tool } from "@/types/tool";

import { RequestForm } from "./RequestForm";

interface RequestToolModalProps {
  tool: Tool & {
    profiles: {
      id: string;
      first_name: string;
      last_name: string;
      bio: string | null;
    };
  };
  isOpen: boolean;
  onClose: () => void;
}

export function RequestToolModal({
  tool,
  isOpen,
  onClose,
}: RequestToolModalProps) {
  if (!isOpen) return null;

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md rounded-lg border border-zinc-950/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <div className="mb-4 flex items-center justify-between">
          <Heading level={3} className="text-lg font-semibold">
            Request to Borrow
          </Heading>
          <Button plain onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div>
          <RequestForm tool={tool} onSubmit={onClose} />
        </div>
      </div>
    </div>
  );
}
