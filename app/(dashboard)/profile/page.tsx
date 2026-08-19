import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileView } from "./ProfileView";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: config }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("config").select("condo_name").single(),
  ]);
  if (!profile) redirect("/login");

  return <ProfileView profile={profile} email={user.email ?? ""} condoName={config?.condo_name ?? "—"} />;
}
