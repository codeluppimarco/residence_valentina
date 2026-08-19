import { createClient } from "@/lib/supabase/server";
import { CashLedgerView } from "./CashLedgerView";

export default async function CashLedgerPage() {
  const supabase = await createClient();
  const { data: entries } = await supabase
    .from("cash_ledger")
    .select("*")
    .order("entry_date", { ascending: false })
    .order("created_at", { ascending: false });

  const balance = (entries ?? []).reduce((sum, e) => sum + e.amount, 0);

  return <CashLedgerView entries={entries ?? []} balance={balance} />;
}
