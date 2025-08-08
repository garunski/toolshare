import { Button } from "@/primitives/button";
import { Text } from "@/primitives/text";

interface ConversationHeaderProps {
  otherUser: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
  onBack: () => void;
}

export function ConversationHeader({
  otherUser,
  onBack,
}: ConversationHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-200 p-4 dark:border-zinc-700">
      <div className="flex items-center space-x-3">
        <Button onClick={onBack} outline>
          ← Back
        </Button>
        <div className="h-8 w-8 rounded-full bg-zinc-300 dark:bg-zinc-600" />
        <div>
          <Text className="font-medium">
            {otherUser.first_name} {otherUser.last_name}
          </Text>
          <Text className="text-sm text-zinc-600 dark:text-zinc-400">
            Online
          </Text>
        </div>
      </div>
    </div>
  );
}
