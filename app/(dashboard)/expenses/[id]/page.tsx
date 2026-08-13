import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { expenses } from "@/lib/mock-data";

type ExpenseDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ExpenseDetailPage({ params }: ExpenseDetailPageProps) {
  const { id } = await params;
  const expense = expenses.find((e) => e.id === Number(id));
  if (!expense) notFound();

  return (
    <div>
      <Link href="/expenses" className="mb-4 inline-block text-[13.5px] font-bold text-primary">
        &larr; Torna a spese &amp; pagamenti
      </Link>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Panel>
          <div className="text-xl font-bold text-ink">{expense.description}</div>
          <div className="mb-4 mt-1 text-[13.5px] text-sub">
            {expense.category} · {expense.dateLabel}
          </div>
          <div className="mb-5 text-[30px] font-bold text-ink">{expense.amountLabel}</div>

          <div className="flex items-center justify-between border-t border-border py-2.5">
            <div className="text-[13px] font-semibold text-sub">Stato</div>
            <Badge status={expense.status} />
          </div>
          <div className="flex items-center justify-between border-t border-border py-2.5">
            <div className="text-[13px] font-semibold text-sub">Ripartizione</div>
            <div className="text-[13.5px] font-semibold text-ink">
              Per millesimi di proprietà, su tutte le unità
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-border py-2.5">
            <div className="text-[13px] font-semibold text-sub">Allegati</div>
            <div className="text-[13.5px] font-semibold text-ink">fattura-{expense.id}.pdf</div>
          </div>

          <div className="mt-5 flex gap-2.5">
            <Button variant="secondary">Modifica</Button>
            <Button variant="danger">Elimina</Button>
          </div>
        </Panel>

        <Panel>
          <div className="mb-1 text-[15.5px] font-bold text-ink">Cronologia</div>
          <div className="flex items-center gap-2.5 py-2 text-[13.5px] text-ink">
            <span className="h-2 w-2 shrink-0 rounded-pill bg-success" />
            Spesa registrata · {expense.dateLabel}
          </div>
          <div className="flex items-center gap-2.5 py-2 text-[13.5px] text-ink">
            <span className="h-2 w-2 shrink-0 rounded-pill bg-success" />
            Ripartita tra le unità
          </div>
          <div className="flex items-center gap-2.5 py-2 text-[13.5px] text-ink">
            <span className="h-2 w-2 shrink-0 rounded-pill bg-border" />
            In attesa di saldo
          </div>
        </Panel>
      </div>
    </div>
  );
}
