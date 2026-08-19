"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database";
import type { PaymentStatus, SplitMethod } from "@/lib/db-types";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

type CreateExpenseInput = {
  description: string;
  category: string;
  amount: number;
  expenseDate: string;
  splitMethod: SplitMethod;
  notes: string;
};

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

// Calcola e congela la quota per unità secondo la modalità scelta (README
// §4bis). Nota: ogni quota viene arrotondata ai 2 decimali indipendentemente,
// quindi la somma delle quote può differire dall'importo totale di qualche
// centesimo per via degli arrotondamenti — accettato come limite noto,
// nessuna unità "assorbe" la differenza.
function computeShares(
  units: { id: string; millesimi: number; resident_count: number }[],
  amount: number,
  splitMethod: SplitMethod,
): { unit_id: string; amount: number; basis: Json }[] {
  if (splitMethod === "millesimi") {
    const totalMillesimi = units.reduce((sum, u) => sum + u.millesimi, 0);
    return units.map((u) => ({
      unit_id: u.id,
      amount: round2((amount * u.millesimi) / totalMillesimi),
      basis: { method: "millesimi", unit_millesimi: u.millesimi, total_millesimi: totalMillesimi },
    }));
  }
  if (splitMethod === "persone") {
    const totalResidents = units.reduce((sum, u) => sum + u.resident_count, 0);
    return units.map((u) => ({
      unit_id: u.id,
      amount: round2((amount * u.resident_count) / totalResidents),
      basis: { method: "persone", unit_residents: u.resident_count, total_residents: totalResidents },
    }));
  }
  return units.map((u) => ({
    unit_id: u.id,
    amount: round2(amount / units.length),
    basis: { method: "unita", active_units_count: units.length },
  }));
}

export async function createExpense(input: CreateExpenseInput): Promise<{ error?: string }> {
  if (!input.description.trim() || !input.amount || input.amount <= 0) {
    return { error: "Descrizione e importo sono obbligatori." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: units, error: unitsError } = await supabase
    .from("units")
    .select("id, millesimi, resident_count")
    .eq("is_active", true);

  if (unitsError) return { error: unitsError.message };
  if (!units || units.length === 0) {
    return { error: "Nessuna unità attiva su cui ripartire la spesa." };
  }
  if (input.splitMethod === "millesimi" && units.reduce((sum, u) => sum + u.millesimi, 0) <= 0) {
    return { error: "Nessuna unità ha i millesimi impostati: imposta i millesimi in Unità prima di continuare." };
  }
  if (input.splitMethod === "persone" && units.reduce((sum, u) => sum + u.resident_count, 0) <= 0) {
    return { error: "Nessuna unità ha residenti impostati: imposta i residenti in Unità prima di continuare." };
  }

  const shares = computeShares(units, input.amount, input.splitMethod);

  const { data: expense, error: expenseError } = await supabase
    .from("expenses")
    .insert({
      description: input.description,
      category: input.category,
      amount: input.amount,
      expense_date: input.expenseDate,
      split_method: input.splitMethod,
      notes: input.notes || null,
      created_by: user?.id ?? null,
    })
    .select("id")
    .single();

  if (expenseError || !expense) {
    return { error: expenseError?.message ?? "Errore nella creazione della spesa." };
  }

  const { data: insertedShares, error: sharesError } = await supabase
    .from("expense_shares")
    .insert(shares.map((s) => ({ expense_id: expense.id, unit_id: s.unit_id, amount: s.amount, basis: s.basis })))
    .select("id");

  if (sharesError || !insertedShares) {
    await supabase.from("expenses").delete().eq("id", expense.id);
    return { error: sharesError?.message ?? "Errore nel calcolo delle quote." };
  }

  const { error: paymentsError } = await supabase
    .from("payments")
    .insert(insertedShares.map((s) => ({ expense_share_id: s.id })));

  if (paymentsError) {
    // on delete cascade su expense_shares.expense_id ripulisce anche le shares
    await supabase.from("expenses").delete().eq("id", expense.id);
    return { error: paymentsError.message };
  }

  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  return {};
}

type UpdateExpenseMetaInput = {
  id: string;
  description: string;
  category: string;
  expenseDate: string;
  notes: string;
};

// Modifica solo i campi non finanziari (descrizione, categoria, data,
// note). Importo e metodo di ripartizione non sono modificabili qui:
// cambiarli richiederebbe ricalcolare expense_shares, il che
// invaliderebbe/perderebbe lo stato dei pagamenti già registrati.
// Per correggere un importo o un metodo sbagliato la via prevista è
// eliminare la spesa e registrarla di nuovo.
export async function updateExpenseMeta(input: UpdateExpenseMetaInput): Promise<{ error?: string }> {
  if (!input.description.trim()) {
    return { error: "La descrizione è obbligatoria." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("expenses")
    .update({
      description: input.description,
      category: input.category,
      expense_date: input.expenseDate,
      notes: input.notes || null,
    })
    .eq("id", input.id);

  if (error) return { error: error.message };

  revalidatePath("/expenses");
  revalidatePath(`/expenses/${input.id}`);
  revalidatePath("/dashboard");
  return {};
}

export async function deleteExpense(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  // on delete cascade su expense_shares.expense_id (e su payments.expense_share_id,
  // e su cash_ledger.expense_id che diventa null) ripulisce quote e pagamenti collegati.
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  revalidatePath("/cash-ledger");
  return {};
}

// Tiene sincronizzata la voce di entrata nel registro di cassa con lo stato
// del pagamento: la rimuove sempre e la ricrea se il pagamento è "pagato",
// così non ci sono duplicati né voci con data/importo disallineati.
async function syncPaymentLedgerEntry(
  supabase: SupabaseServerClient,
  paymentId: string,
  status: PaymentStatus,
  paidAt: string | null,
) {
  await supabase.from("cash_ledger").delete().eq("payment_id", paymentId);
  if (status !== "pagato" || !paidAt) return;

  const { data: payment } = await supabase
    .from("payments")
    .select("expense_shares(amount, units(label), expenses(description))")
    .eq("id", paymentId)
    .single();

  const share = payment?.expense_shares;
  if (!share) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from("cash_ledger").insert({
    entry_date: paidAt,
    description: `Quota ${share.units?.label ?? "unità"} — ${share.expenses?.description ?? "spesa"}`,
    amount: share.amount,
    payment_id: paymentId,
    created_by: user?.id ?? null,
  });
}

export async function updatePaymentStatus(
  paymentId: string,
  status: PaymentStatus,
  expenseId: string,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const paidAt = status === "pagato" ? new Date().toISOString().slice(0, 10) : null;
  const { error } = await supabase.from("payments").update({ status, paid_at: paidAt }).eq("id", paymentId);

  if (error) return { error: error.message };

  await syncPaymentLedgerEntry(supabase, paymentId, status, paidAt);

  revalidatePath(`/expenses/${expenseId}`);
  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  revalidatePath("/cash-ledger");
  return {};
}

// Segna come pagato con una data scelta invece della data odierna (usata
// invece da updatePaymentStatus per il toggle rapido dal badge).
export async function setPaymentPaidDate(
  paymentId: string,
  paidAt: string,
  expenseId: string,
): Promise<{ error?: string }> {
  if (!paidAt) return { error: "Seleziona una data." };

  const supabase = await createClient();
  const { error } = await supabase.from("payments").update({ status: "pagato", paid_at: paidAt }).eq("id", paymentId);

  if (error) return { error: error.message };

  await syncPaymentLedgerEntry(supabase, paymentId, "pagato", paidAt);

  revalidatePath(`/expenses/${expenseId}`);
  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  revalidatePath("/cash-ledger");
  return {};
}

// Saldare al fornitore è un movimento di cassa distinto dal pagamento delle
// quote (vedi commento sulla colonna expenses.settled_at nella migration):
// qui si registra che l'amministratore ha pagato la spesa nel suo insieme.
export async function markExpenseSettled(id: string, settledAt: string): Promise<{ error?: string }> {
  if (!settledAt) return { error: "Seleziona una data." };

  const supabase = await createClient();
  const { data: expense, error: expenseError } = await supabase
    .from("expenses")
    .select("description, amount")
    .eq("id", id)
    .single();
  if (expenseError || !expense) return { error: expenseError?.message ?? "Spesa non trovata." };

  const { error } = await supabase.from("expenses").update({ settled_at: settledAt }).eq("id", id);
  if (error) return { error: error.message };

  await supabase.from("cash_ledger").delete().eq("expense_id", id);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  await supabase.from("cash_ledger").insert({
    entry_date: settledAt,
    description: `Pagamento fornitore — ${expense.description}`,
    amount: -expense.amount,
    expense_id: id,
    created_by: user?.id ?? null,
  });

  revalidatePath(`/expenses/${id}`);
  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  revalidatePath("/cash-ledger");
  return {};
}

export async function unmarkExpenseSettled(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("expenses").update({ settled_at: null }).eq("id", id);
  if (error) return { error: error.message };

  await supabase.from("cash_ledger").delete().eq("expense_id", id);

  revalidatePath(`/expenses/${id}`);
  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  revalidatePath("/cash-ledger");
  return {};
}

// Il file va già caricato su Storage lato client (bucket "expense-attachments");
// qui si salva solo il percorso, stesso pattern di documents/actions.ts.
export async function saveExpenseAttachment(
  id: string,
  field: "quote_path" | "invoice_path",
  storagePath: string,
): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { data: existing } = await supabase.from("expenses").select("quote_path, invoice_path").eq("id", id).single();
  const previousPath = existing?.[field];

  const { error } =
    field === "quote_path"
      ? await supabase.from("expenses").update({ quote_path: storagePath }).eq("id", id)
      : await supabase.from("expenses").update({ invoice_path: storagePath }).eq("id", id);

  if (error) {
    await supabase.storage.from("expense-attachments").remove([storagePath]);
    return { error: error.message };
  }

  if (previousPath) {
    await supabase.storage.from("expense-attachments").remove([previousPath]);
  }

  revalidatePath(`/expenses/${id}`);
  return {};
}
