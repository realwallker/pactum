import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MyIdeaView } from "@/components/ideas/my-idea-view";

export default async function MyIdeaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: activeIdea } = await supabase
    .from("ideas")
    .select("*")
    .eq("owner_id", user.id)
    .eq("is_active", true)
    .single();

  // Get pending interests count
  let pendingCount = 0;
  if (activeIdea) {
    const { count } = await supabase
      .from("matches")
      .select("*", { count: "exact", head: true })
      .eq("idea_id", activeIdea.id)
      .eq("status", "pending");
    pendingCount = count ?? 0;
  }

  return <MyIdeaView activeIdea={activeIdea} pendingCount={pendingCount} />;
}
