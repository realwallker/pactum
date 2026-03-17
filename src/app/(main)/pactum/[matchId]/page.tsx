import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PactumPage } from "@/components/pactum/pactum-page";
import { MatchWithDetails } from "@/types/app.types";

export default async function PactumRoute({
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

  const { data: pactum } = await supabase
    .from("pactums")
    .select("*")
    .eq("match_id", matchId)
    .single();

  return (
    <PactumPage
      matchId={matchId}
      match={match}
      pactum={pactum ?? null}
      currentUserId={user.id}
    />
  );
}
