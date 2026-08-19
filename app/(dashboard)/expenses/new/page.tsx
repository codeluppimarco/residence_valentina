import { createClient } from "@/lib/supabase/server";
import { NewExpenseForm } from "./NewExpenseForm";

export default async function NewExpensePage() {
  const supabase = await createClient();
  const { data: config } = await supabase.from("config").select("default_split_method").single();

  return <NewExpenseForm defaultSplitMethod={config?.default_split_method ?? "millesimi"} />;
}
