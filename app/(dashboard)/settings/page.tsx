import { createClient } from "@/lib/supabase/server";
import { SettingsView } from "./SettingsView";

export default async function SettingsPage() {
  const supabase = await createClient();

  const [{ data: config }, { data: profiles }, { data: units }] = await Promise.all([
    supabase.from("config").select("*").single(),
    supabase
      .from("profiles")
      .select("id, full_name, role, unit_id, units(label)")
      .order("full_name"),
    supabase.from("units").select("id, label").order("label"),
  ]);

  return <SettingsView config={config ?? null} profiles={profiles ?? []} units={units ?? []} />;
}
