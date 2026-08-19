import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { TableCard, TableCell, TableCellStrong, TableHeaderRow, TableHeadCell } from "@/components/ui/Table";
import { cn } from "@/lib/cn";
import { formatCurrency, formatDate } from "@/lib/format";
import { aggregatePaymentStatus } from "@/lib/status";
import type { PaymentStatus } from "@/lib/db-types";
import { createClient } from "@/lib/supabase/server";

const GRID_COLS = "grid-cols-[110px_1.6fr_1fr_110px_110px]";

export default async function ExpensesPage() {
  const supabase = await createClient();
  const { data: expenses } = await supabase
    .from("expenses")
    .select("id, description, category, amount, expense_date, expense_shares(payments(status))")
    .order("expense_date", { ascending: false });

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="text-[22px] font-bold text-ink">Spese &amp; pagamenti</div>
          <div className="mt-1 text-[13.5px] text-sub">Registro delle spese condominiali</div>
        </div>
        <Link href="/expenses/new" className={buttonClasses("primary", "sm")}>
          + Nuova spesa
        </Link>
      </div>

      <TableCard>
        <TableHeaderRow className={GRID_COLS}>
          <TableHeadCell>Data</TableHeadCell>
          <TableHeadCell>Descrizione</TableHeadCell>
          <TableHeadCell>Categoria</TableHeadCell>
          <TableHeadCell>Importo</TableHeadCell>
          <TableHeadCell>Stato</TableHeadCell>
        </TableHeaderRow>
        {(expenses ?? []).map((expense) => {
          const statuses = expense.expense_shares
            .map((es) => es.payments?.status)
            .filter((s): s is PaymentStatus => Boolean(s));
          return (
            <Link
              key={expense.id}
              href={`/expenses/${expense.id}`}
              className={cn(
                GRID_COLS,
                "grid min-w-[640px] items-center border-b border-border last:border-b-0 hover:bg-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary",
              )}
            >
              <TableCell>{formatDate(expense.expense_date)}</TableCell>
              <TableCellStrong>{expense.description}</TableCellStrong>
              <TableCell>{expense.category}</TableCell>
              <TableCell>{formatCurrency(expense.amount)}</TableCell>
              <TableCell>
                <Badge status={aggregatePaymentStatus(statuses)} />
              </TableCell>
            </Link>
          );
        })}
        {(expenses ?? []).length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-sub">Nessuna spesa registrata.</div>
        )}
      </TableCard>
    </div>
  );
}
