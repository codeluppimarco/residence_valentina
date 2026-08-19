import { createClient } from "@/lib/supabase/server";
import { ReportsView } from "./ReportsView";

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data: reports } = await supabase.from("reports").select("*").order("created_at", { ascending: false });

  return <ReportsView reports={reports ?? []} />;
}
