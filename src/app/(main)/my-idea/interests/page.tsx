import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InterestsInbox } from "@/components/matches/interests-inbox";

export default async function InterestsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get user's active idea
  const { data: activeIdea } = await supabase
    .from("ideas")
    .select("*")
    .eq("owner_id", user.id)
    .eq("is_active", true)
    .single();

  if (!activeIdea) redirect("/my-idea");

  // Get pending interests with user profiles
  const { data: pendingMatches } = await supabase
    .from("matches")
    .select(
      `
      *,
      interested_user:profiles!matches_interested_user_id_fkey(*)
    `,
    )
    .eq("idea_id", activeIdea.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <InterestsInbox idea={activeIdea} pendingMatches={(pendingMatches ?? []) as any} />
  );
}
