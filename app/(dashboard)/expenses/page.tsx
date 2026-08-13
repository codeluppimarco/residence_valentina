import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { TableCard, TableCell, TableCellStrong, TableHeaderRow, TableHeadCell } from "@/components/ui/Table";
import { cn } from "@/lib/cn";
import { expenses } from "@/lib/mock-data";

const GRID_COLS = "grid-cols-[110px_1.6fr_1fr_110px_110px]";

export default function ExpensesPage() {
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
        {expenses.map((expense) => (
          <Link
            key={expense.id}
            href={`/expenses/${expense.id}`}
            className={cn(
              GRID_COLS,
              "grid min-w-[640px] items-center border-b border-border last:border-b-0 hover:bg-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary",
            )}
          >
            <TableCell>{expense.dateLabel}</TableCell>
            <TableCellStrong>{expense.description}</TableCellStrong>
            <TableCell>{expense.category}</TableCell>
            <TableCell>{expense.amountLabel}</TableCell>
            <TableCell>
              <Badge status={expense.status} />
            </TableCell>
          </Link>
        ))}
      </TableCard>
    </div>
  );
}
