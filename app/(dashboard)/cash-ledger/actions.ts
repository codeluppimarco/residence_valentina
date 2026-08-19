"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type CreateLedgerEntryInput = {
  entryDate: string;
  description: string;
  amount: number;
  direction: "entrata" | "uscita";
};

export async function createLedgerEntry(input: CreateLedgerEntryInput): Promise<{ error?: string }> {
  if (!input.description.trim() || !input.amount || input.amount <= 0) {
    return { error: "Descrizione e importo sono obbligatori." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("cash_ledger").insert({
    entry_date: input.entryDate || new Date().toISOString().slice(0, 10),
    description: input.description,
    amount: input.direction === "entrata" ? input.amount : -input.amount,
    created_by: user?.id ?? null,
  });

  if (error) return { error: error.message };

  revalidatePath("/cash-ledger");
  revalidatePath("/dashboard");
  return {};
}

// Cancellabili solo le voci manuali (senza expense_id/payment_id): quelle
// generate automaticamente vanno rimosse tramite l'azione che le ha create
// (segna pagamento in attesa, togli spesa saldata), non eliminate a parte,
// altrimenti si disallineano dallo stato che rappresentano.
export async function deleteLedgerEntry(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: entry } = await supabase.from("cash_ledger").select("expense_id, payment_id").eq("id", id).single();
  if (entry?.expense_id || entry?.payment_id) {
    return {
      error: "Questa voce è generata automaticamente: annulla il pagamento o lo stato \"saldata\" collegato invece di eliminarla qui.",
    };
  }

  const { error } = await supabase.from("cash_ledger").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/cash-ledger");
  revalidatePath("/dashboard");
  return {};
}
