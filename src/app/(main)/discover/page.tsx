import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DiscoverFeed } from "@/components/discover/discover-feed";
import { IdeaWithOwner } from "@/types/app.types";

export default async function DiscoverPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get IDs of ideas the user has already swiped
  const { data: swipedIds } = await supabase
    .from("swipes")
    .select("idea_id")
    .eq("swiper_id", user.id);

  const swipedIdeaIds = swipedIds?.map((s) => s.idea_id) ?? [];

  // Build query for undiscovered ideas
  let query = supabase
    .from("ideas")
    .select(
      `
      *,
      owner:profiles!ideas_owner_id_fkey(*)
    `,
    )
    .eq("is_active", true)
    .neq("owner_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (swipedIdeaIds.length > 0) {
    query = query.not("id", "in", `(${swipedIdeaIds.join(",")})`);
  }

  const { data: ideas } = await query;

  return <DiscoverFeed ideas={(ideas ?? []) as unknown as IdeaWithOwner[]} userId={user.id} />;
}
