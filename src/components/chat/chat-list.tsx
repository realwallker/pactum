import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";

interface Match {
  id: string;
  idea_owner_id: string;
  interested_user_id: string;
  idea: { title: string } | null;
  idea_owner: { id: string; full_name: string; avatar_url: string | null };
  interested_user: { id: string; full_name: string; avatar_url: string | null };
  latest_message: {
    content: string;
    sender_id: string;
    created_at: string;
  } | null;
  unread_count: number;
}

interface ChatListProps {
  matches: Match[];
  currentUserId: string;
}

export function ChatList({ matches, currentUserId }: ChatListProps) {
  return (
    <div className="px-4 py-6 space-y-1">
      <h1 className="text-xl font-bold text-zinc-900 mb-4">Messages</h1>

      {matches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center">
            <MessageCircle className="h-6 w-6 text-violet-600" />
          </div>
          <div>
            <p className="font-semibold text-zinc-900">No messages yet</p>
            <p className="text-sm text-zinc-500 mt-1">
              Get matched with collaborators to start chatting
            </p>
          </div>
        </div>
      ) : (
        matches.map((match) => {
          const isOwner = match.idea_owner_id === currentUserId;
          const otherPerson = isOwner
            ? match.interested_user
            : match.idea_owner;
          const hasUnread = match.unread_count > 0;

          return (
            <Link
              key={match.id}
              href={`/chat/${match.id}`}
              className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white hover:shadow-sm transition-all"
            >
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>
                    {otherPerson?.full_name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {hasUnread && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-violet-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                    {match.unread_count > 9 ? "9+" : match.unread_count}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-1">
                  <p
                    className={`font-medium text-sm truncate ${hasUnread ? "text-zinc-900" : "text-zinc-700"}`}
                  >
                    {otherPerson?.full_name}
                  </p>
                  {match.latest_message && (
                    <span className="text-[10px] text-zinc-400 flex-shrink-0">
                      {formatDate(match.latest_message.created_at)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 truncate">
                  {match.idea?.title}
                </p>
                {match.latest_message && (
                  <p
                    className={`text-xs truncate mt-0.5 ${hasUnread ? "text-zinc-700 font-medium" : "text-zinc-400"}`}
                  >
                    {match.latest_message.sender_id === currentUserId
                      ? "You: "
                      : ""}
                    {match.latest_message.content}
                  </p>
                )}
              </div>
            </Link>
          );
        })
      )}
    </div>
  );
}
