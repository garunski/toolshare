"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { MessageThreadHandler } from "../../../../common/operations/messageThreadHandler";
import { useAuth } from "../../../../hooks/useAuth";
import type { Message, SocialProfile } from "../../../../types/social";

import { MessageContainer } from "./components/MessageContainer";
import { MessageHeader } from "./components/MessageHeader";

export default function MessagePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<SocialProfile | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const subscriptionRef = useRef<any>(null);

  const otherUserId = params.userId as string;

  const fetchOtherUserProfile =
    useCallback(async (): Promise<SocialProfile> => {
      return {
        id: otherUserId,
        first_name: "User",
        last_name: otherUserId.slice(0, 8),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }, [otherUserId]);

  const loadMessages = useCallback(async () => {
    if (!user || !otherUserId) return;

    try {
      setLoading(true);
      const [messagesData, otherUserData] = await Promise.all([
        MessageThreadHandler.getMessages(user.id, otherUserId),
        fetchOtherUserProfile(),
      ]);

      setMessages(messagesData);
      setOtherUser(otherUserData);
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setLoading(false);
    }
  }, [user, otherUserId, fetchOtherUserProfile]);

  const setupSubscription = useCallback(() => {
    if (!user || !otherUserId) return;

    subscriptionRef.current = MessageThreadHandler.subscribeToConversation(
      user.id,
      otherUserId,
      (newMessage: Message) => {
        setMessages((prev) => [...prev, newMessage]);
      },
    );
  }, [user, otherUserId]);

  useEffect(() => {
    if (user && otherUserId) {
      loadMessages();
      setupSubscription();
    }

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [user, otherUserId, loadMessages, setupSubscription]);

  const handleSendMessage = async () => {
    if (!user || !otherUserId || !newMessage.trim() || sending) return;

    try {
      setSending(true);
      const message = await MessageThreadHandler.sendMessage(
        {
          receiver_id: otherUserId,
          content: newMessage.trim(),
        },
        user.id,
      );

      setMessages((prev) => [...prev, message]);
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleBack = () => router.back();

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-lg">Loading conversation...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <MessageHeader
        otherUser={otherUser}
        messageCount={messages.length}
        onBack={handleBack}
      />

      <MessageContainer
        messages={messages}
        currentUserId={user?.id || ""}
        newMessage={newMessage}
        sending={sending}
        onMessageChange={setNewMessage}
        onSendMessage={handleSendMessage}
        onKeyPress={handleKeyPress}
      />
    </div>
  );
}
