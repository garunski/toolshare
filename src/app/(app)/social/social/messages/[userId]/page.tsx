import { ConversationHeader } from "./components/ConversationHeader";
import { MessageInput } from "./components/MessageInput";
import { MessagesList } from "./components/MessagesList";
import { getConversationData } from "./getConversationData";

interface MessagesPageProps {
  params: Promise<{ userId: string }>;
}

export default async function MessagesPage({ params }: MessagesPageProps) {
  const { userId } = await params;
  const { otherUser, messages, currentUserId } =
    await getConversationData(userId);

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="flex h-[600px] flex-col rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
        <ConversationHeader
          otherUser={otherUser}
          onBack={() => window.history.back()}
        />

        <div className="flex flex-1 flex-col">
          <MessagesList
            messages={messages}
            currentUserId={currentUserId}
            otherUserId={userId}
          />
        </div>

        <MessageInput receiverId={userId} currentUserId={currentUserId} />
      </div>
    </div>
  );
}
