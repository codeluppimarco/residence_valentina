import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Panel } from "@/components/ui/Panel";
import { formatCurrency, formatDate, splitMethodLabel } from "@/lib/format";
import { aggregatePaymentStatus } from "@/lib/status";
import type { PaymentStatus } from "@/lib/db-types";
import { createClient } from "@/lib/supabase/server";
import { PaymentsPanel, type ShareRow } from "./PaymentsPanel";
import { ExpenseActions } from "./ExpenseActions";
import { ExpenseAttachments } from "./ExpenseAttachments";

type ExpenseDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ExpenseDetailPage({ params }: ExpenseDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: expense } = await supabase
    .from("expenses")
    .select(
      `id, description, category, amount, expense_date, split_method, notes,
       quote_path, invoice_path, settled_at,
       expense_shares ( id, amount, units ( label ), payments ( id, status, paid_at ) )`,
    )
    .eq("id", id)
    .single();

  if (!expense) notFound();

  const [quoteSigned, invoiceSigned] = await Promise.all([
    expense.quote_path
      ? supabase.storage.from("expense-attachments").createSignedUrl(expense.quote_path, 3600)
      : Promise.resolve({ data: null }),
    expense.invoice_path
      ? supabase.storage.from("expense-attachments").createSignedUrl(expense.invoice_path, 3600)
      : Promise.resolve({ data: null }),
  ]);

  const shares: ShareRow[] = expense.expense_shares.flatMap((es) => {
    const payment = es.payments;
    if (!payment) return [];
    return [
      {
        paymentId: payment.id,
        unitLabel: es.units?.label ?? "—",
        amount: es.amount,
        status: payment.status as PaymentStatus,
        paidAt: payment.paid_at,
      },
    ];
  });

  const aggregateStatus = aggregatePaymentStatus(shares.map((s) => s.status));

  return (
    <div>
      <Link href="/expenses" className="mb-4 inline-block text-[13.5px] font-bold text-primary">
        &larr; Torna a spese &amp; pagamenti
      </Link>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Panel>
          <div className="text-xl font-bold text-ink">{expense.description}</div>
          <div className="mb-4 mt-1 text-[13.5px] text-sub">
            {expense.category} · {formatDate(expense.expense_date)}
          </div>
          <div className="mb-5 text-[30px] font-bold text-ink">{formatCurrency(expense.amount)}</div>

          <div className="flex items-center justify-between border-t border-border py-2.5">
            <div className="text-[13px] font-semibold text-sub">Stato</div>
            <Badge status={aggregateStatus} />
          </div>
          <div className="flex items-center justify-between border-t border-border py-2.5">
            <div className="text-[13px] font-semibold text-sub">Ripartizione</div>
            <div className="text-[13.5px] font-semibold text-ink">
              Per {splitMethodLabel(expense.split_method)}, su {shares.length} unità
            </div>
          </div>
          {expense.notes && (
            <div className="flex items-center justify-between border-t border-border py-2.5">
              <div className="text-[13px] font-semibold text-sub">Note</div>
              <div className="text-[13.5px] font-semibold text-ink">{expense.notes}</div>
            </div>
          )}

          <ExpenseActions
            id={expense.id}
            description={expense.description}
            category={expense.category}
            expenseDate={expense.expense_date}
            notes={expense.notes ?? ""}
          />
        </Panel>

        <div className="flex flex-col gap-5">
          <PaymentsPanel expenseId={expense.id} shares={shares} />
          <ExpenseAttachments
            expenseId={expense.id}
            amount={expense.amount}
            quotePath={expense.quote_path}
            quoteUrl={quoteSigned.data?.signedUrl ?? null}
            invoicePath={expense.invoice_path}
            invoiceUrl={invoiceSigned.data?.signedUrl ?? null}
            settledAt={expense.settled_at}
          />
        </div>
      </div>
    </div>
  );
}
