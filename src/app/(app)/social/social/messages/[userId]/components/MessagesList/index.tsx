import { Text } from "@/primitives/text";
import type { Message } from "@/types/social";

interface MessagesListProps {
  messages: Message[];
  currentUserId: string;
  otherUserId: string;
}

export function MessagesList({
  messages,
  currentUserId,
  otherUserId,
}: MessagesListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <Text className="text-zinc-600 dark:text-zinc-400">
          No messages yet. Start a conversation!
        </Text>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 overflow-y-auto p-4">
      {messages.map((message) => {
        const isOwnMessage = message.sender_id === currentUserId;

        return (
          <div
            key={message.id}
            className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs rounded-lg px-4 py-2 ${
                isOwnMessage
                  ? "bg-blue-500 text-white"
                  : "bg-zinc-100 text-zinc-900 dark:bg-zinc-700 dark:text-white"
              }`}
            >
              <Text className="text-sm">{message.content}</Text>
              <Text className="mt-1 text-xs opacity-70">
                {new Date(message.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </div>
          </div>
        );
      })}
    </div>
  );
}
