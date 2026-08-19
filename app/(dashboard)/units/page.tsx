import { createClient } from "@/lib/supabase/server";
import { UnitsView } from "./UnitsView";

export default async function UnitsPage() {
  const supabase = await createClient();
  const { data: units } = await supabase.from("units").select("*").order("label");

  return <UnitsView units={units ?? []} />;
}
