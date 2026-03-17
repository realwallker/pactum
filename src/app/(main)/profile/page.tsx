import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileView } from "@/components/profile/profile-view";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: activeIdea } = await supabase
    .from("ideas")
    .select("*")
    .eq("owner_id", user.id)
    .eq("is_active", true)
    .single();

  return (
    <ProfileView profile={profile!} activeIdea={activeIdea} isOwnProfile />
  );
}
