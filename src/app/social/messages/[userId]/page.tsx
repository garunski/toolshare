"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/common/hooks/useAuth";
import { MessageOperations } from "@/common/operations/messageOperations";
import { SocialConnectionProcessor } from "@/common/operations/socialConnectionProcessor";
import type { Message, SocialProfile } from "@/types/social";

import { MessageContainer } from "./components/MessageContainer";
import { MessageHeader } from "./components/MessageHeader";

export default function MessagesPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const otherUserId = params.userId as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<SocialProfile | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadMessages = useCallback(async () => {
    if (!user?.id) return;

    try {
      const result = await MessageOperations.getMessages(user.id, otherUserId);
      if (result.success) {
        setMessages(result.data || []);
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, otherUserId]);

  const loadOtherUser = useCallback(async () => {
    try {
      const result = await SocialConnectionProcessor.getProfile(otherUserId);
      if (result.success && result.data) {
        setOtherUser(result.data);
      }
    } catch (error) {
      console.error("Failed to load other user:", error);
    }
  }, [otherUserId]);

  useEffect(() => {
    if (user?.id) {
      loadMessages();
      loadOtherUser();
    }
  }, [loadMessages, loadOtherUser, user?.id]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user?.id) return;

    setSending(true);
    try {
      const result = await MessageOperations.sendMessage(
        user.id,
        otherUserId,
        newMessage,
      );
      if (result.success && result.data) {
        setMessages((prev) => [...prev, result.data]);
        setNewMessage("");
      }
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

  const handleBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl p-6">
        <div className="flex items-center justify-center p-8">
          <p>Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="flex h-[600px] flex-col rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
        <MessageHeader otherUserId={otherUserId} onBack={handleBack} />
        <MessageContainer otherUserId={otherUserId} />
      </div>
    </div>
  );
}
