import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MatchesList } from "@/components/matches/matches-list";
import { MatchWithDetails } from "@/types/app.types";

export default async function MatchesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

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

  return <MatchesList matches={(matches ?? []) as unknown as MatchWithDetails[]} currentUserId={user.id} />;
}
