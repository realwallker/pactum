"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText, Send } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Message } from "@/types/app.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import { Pactum } from "@/types/app.types";

interface ChatWindowProps {
  matchId: string;
  currentUserId: string;
  otherPerson: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  } | null;
  idea: { id: string; title: string } | null;
  initialMessages: Message[];
  pactum: Pactum | null;
}

export function ChatWindow({
  matchId,
  currentUserId,
  otherPerson,
  idea,
  initialMessages,
  pactum,
}: ChatWindowProps) {
  const router = useRouter();
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel(`chat:${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => {
            if (prev.find((m) => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
          // Mark as read if from other person
          if (newMessage.sender_id !== currentUserId) {
            supabase
              .from("messages")
              .update({ read_at: new Date().toISOString() })
              .eq("id", newMessage.id);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId, currentUserId]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || sending) return;
    setSending(true);

    const content = input.trim();
    setInput("");

    const { error } = await supabase.from("messages").insert({
      match_id: matchId,
      sender_id: currentUserId,
      content,
    });

    if (error) {
      setInput(content); // restore on failure
    }
    setSending(false);
  }

  // Group messages by date
  return (
    <div className="flex flex-col h-screen max-h-screen bg-zinc-50">
      {/* Header */}
      <div className="bg-white border-b border-zinc-200 px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => router.push("/chat")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Avatar className="h-8 w-8">
          <AvatarImage src={otherPerson?.avatar_url ?? undefined} />
          <AvatarFallback className="text-xs">
            {otherPerson?.full_name?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-zinc-900 truncate">
            {otherPerson?.full_name}
          </p>
          {idea && (
            <p className="text-[11px] text-zinc-400 truncate">{idea.title}</p>
          )}
        </div>
        <Button variant="ghost" size="icon-sm" asChild title="Pactum Agreement">
          <Link href={`/pactum/${matchId}`}>
            <FileText
              className={`h-4 w-4 ${pactum ? "text-violet-600" : "text-zinc-400"}`}
            />
          </Link>
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-2">
        {messages.length === 0 && (
          <div className="text-center text-zinc-400 text-sm py-8">
            <p>You matched! Say hello and start collaborating.</p>
          </div>
        )}
        {messages.map((message, i) => {
          const isMe = message.sender_id === currentUserId;
          const prevMessage = messages[i - 1];
          const showAvatar =
            !isMe &&
            (!prevMessage || prevMessage.sender_id !== message.sender_id);

          return (
            <div
              key={message.id}
              className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}
            >
              {!isMe && (
                <div className="w-6 flex-shrink-0">
                  {showAvatar && (
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-[10px]">
                        {otherPerson?.full_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              )}
              <div className={`max-w-[75%] space-y-0.5`}>
                <div
                  className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isMe
                      ? "bg-violet-600 text-white rounded-br-sm"
                      : "bg-white border border-zinc-200 text-zinc-800 rounded-bl-sm"
                  }`}
                >
                  {message.content}
                </div>
                <p
                  className={`text-[10px] text-zinc-400 px-1 ${isMe ? "text-right" : ""}`}
                >
                  {formatDate(message.created_at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="bg-white border-t border-zinc-200 px-4 py-3 flex gap-2 flex-shrink-0"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
          disabled={sending}
        />
        <Button type="submit" size="icon" disabled={!input.trim() || sending}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
