import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChatWindow } from "@/components/chat/chat-window";
import { MatchWithDetails } from "@/types/app.types";

export default async function ChatWindowPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: matchRaw } = await supabase
    .from("matches")
    .select(
      `
      *,
      idea:ideas(*),
      idea_owner:profiles!matches_idea_owner_id_fkey(*),
      interested_user:profiles!matches_interested_user_id_fkey(*)
    `,
    )
    .eq("id", matchId)
    .single();

  const match = matchRaw as unknown as MatchWithDetails | null;

  if (!match || match.status !== "matched") redirect("/chat");
  if (match.idea_owner_id !== user.id && match.interested_user_id !== user.id)
    redirect("/chat");

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("match_id", matchId)
    .order("created_at", { ascending: true });

  const { data: pactum } = await supabase
    .from("pactums")
    .select("*")
    .eq("match_id", matchId)
    .single();

  // Mark unread messages as read
  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("match_id", matchId)
    .neq("sender_id", user.id)
    .is("read_at", null);

  const isOwner = match.idea_owner_id === user.id;
  const otherPerson = isOwner ? match.interested_user : match.idea_owner;

  return (
    <ChatWindow
      matchId={matchId}
      currentUserId={user.id}
      otherPerson={otherPerson}
      idea={match.idea}
      initialMessages={messages ?? []}
      pactum={pactum ?? null}
    />
  );
}
