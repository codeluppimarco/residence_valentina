import Link from "next/link";
import { KpiCard } from "@/components/ui/KpiCard";
import { Panel } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Badge";
import { expenses, kpis, reports } from "@/lib/mock-data";

export default function DashboardPage() {
  const recentExpenses = expenses.slice(0, 5);
  const openReports = reports.filter((r) => r.status !== "Risolta").slice(0, 4);

  return (
    <div>
      <div className="text-2xl font-bold text-ink">Buongiorno, Marco</div>
      <div className="mb-7 mt-1 text-[14.5px] text-sub">
        Ecco la situazione del Residence Valentina oggi.
      </div>

      <div className="mb-7 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.3fr_1fr]">
        <Panel>
          <div className="mb-2 flex items-center justify-between">
            <div className="text-[15.5px] font-bold text-ink">Spese recenti</div>
            <Link href="/expenses" className="text-[13px] font-bold text-primary">
              Vedi tutte
            </Link>
          </div>
          {recentExpenses.map((expense) => (
            <Link
              key={expense.id}
              href={`/expenses/${expense.id}`}
              className="flex items-center justify-between border-b border-border py-2.5 last:border-b-0"
            >
              <div>
                <div className="text-sm font-semibold text-ink">{expense.description}</div>
                <div className="mt-0.5 text-[12.5px] text-sub">
                  {expense.dateLabel} · {expense.category}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 text-right">
                <div className="text-[13.5px] font-bold text-ink">{expense.amountLabel}</div>
                <Badge status={expense.status} />
              </div>
            </Link>
          ))}
          {recentExpenses.length === 0 && (
            <p className="py-6 text-center text-sm text-sub">Nessuna spesa registrata.</p>
          )}
        </Panel>

        <Panel>
          <div className="mb-2 flex items-center justify-between">
            <div className="text-[15.5px] font-bold text-ink">Segnalazioni aperte</div>
            <Link href="/reports" className="text-[13px] font-bold text-primary">
              Vedi tutte
            </Link>
          </div>
          {openReports.map((report) => (
            <div
              key={report.id}
              className="flex items-center justify-between gap-3 border-b border-border py-2.5 last:border-b-0"
            >
              <div>
                <div className="text-sm font-semibold text-ink">{report.title}</div>
                <div className="mt-0.5 text-[12.5px] text-sub">
                  {report.unitLabel} · {report.dateLabel}
                </div>
              </div>
              <Badge status={report.status} />
            </div>
          ))}
          {openReports.length === 0 && (
            <p className="py-6 text-center text-sm text-sub">Nessuna segnalazione aperta.</p>
          )}
        </Panel>
      </div>
    </div>
  );
}
