import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChatList } from "@/components/chat/chat-list";
import { MatchWithDetails } from "@/types/app.types";

export default async function ChatPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get all matched conversations
  const { data: matches } = await supabase
    .from("matches")
    .select(
      `
      *,
      idea:ideas(*),
      idea_owner:profiles!matches_idea_owner_id_fkey(*),
      interested_user:profiles!matches_interested_user_id_fkey(*)
    `,
    )
    .or(`idea_owner_id.eq.${user.id},interested_user_id.eq.${user.id}`)
    .eq("status", "matched")
    .order("updated_at", { ascending: false });

  const typedMatches = (matches ?? []) as unknown as MatchWithDetails[];

  // Fetch latest message for each match
  const matchesWithMessages = await Promise.all(
    typedMatches.map(async (match) => {
      const { data: latestMessage } = await supabase
        .from("messages")
        .select("*")
        .eq("match_id", match.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      const { count: unreadCount } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("match_id", match.id)
        .neq("sender_id", user.id)
        .is("read_at", null);

      return {
        ...match,
        latest_message: latestMessage ?? null,
        unread_count: unreadCount ?? 0,
      };
    }),
  );

  return <ChatList matches={matchesWithMessages} currentUserId={user.id} />;
}
