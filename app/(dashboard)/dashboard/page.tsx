import Link from "next/link";
import { KpiCard } from "@/components/ui/KpiCard";
import { Panel } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/format";
import { aggregatePaymentStatus } from "@/lib/status";
import type { PaymentStatus } from "@/lib/db-types";
import type { StatusLabel } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const today = new Date().toISOString().slice(0, 10);

  const [{ data: profile }, { data: units }, { data: ledgerEntries }, { data: nextEvent }, { data: expenses }, { data: reports }] =
    await Promise.all([
      user ? supabase.from("profiles").select("full_name").eq("id", user.id).single() : Promise.resolve({ data: null }),
      supabase.from("units").select("is_active"),
      supabase.from("cash_ledger").select("amount"),
      supabase
        .from("events")
        .select("title, event_date")
        .gte("event_date", today)
        .order("event_date", { ascending: true })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("expenses")
        .select("id, description, category, amount, expense_date, expense_shares(payments(status))")
        .order("expense_date", { ascending: false })
        .limit(5),
      supabase
        .from("reports")
        .select("id, title, unit_label, status, created_at")
        .neq("status", "Risolta")
        .order("created_at", { ascending: false })
        .limit(4),
    ]);

  const firstName = profile?.full_name?.split(" ")[0] ?? "";
  const totalUnits = units?.length ?? 0;
  const occupiedUnits = units?.filter((u) => u.is_active).length ?? 0;
  const vacantUnits = totalUnits - occupiedUnits;
  const cashBalance = (ledgerEntries ?? []).reduce((sum, e) => sum + e.amount, 0);

  const kpis = [
    {
      label: "Saldo cassa",
      value: formatCurrency(cashBalance),
      sub: "Vedi registro di cassa",
    },
    {
      label: "Prossima scadenza",
      value: nextEvent?.title ?? "Nessuna scadenza impostata",
      sub: nextEvent ? formatDate(nextEvent.event_date) : "—",
    },
    {
      label: "Unità gestite",
      value: `${totalUnits} unità`,
      sub: `${occupiedUnits} occupate · ${vacantUnits} vacanti`,
    },
  ];

  return (
    <div>
      <div className="text-2xl font-bold text-ink">Buongiorno{firstName ? `, ${firstName}` : ""}</div>
      <div className="mb-7 mt-1 text-[14.5px] text-sub">Ecco la situazione del Residence Valentina oggi.</div>

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
          {(expenses ?? []).map((expense) => {
            const statuses = expense.expense_shares
              .map((es) => es.payments?.status)
              .filter((s): s is PaymentStatus => Boolean(s));
            return (
              <Link
                key={expense.id}
                href={`/expenses/${expense.id}`}
                className="flex items-center justify-between border-b border-border py-2.5 last:border-b-0"
              >
                <div>
                  <div className="text-sm font-semibold text-ink">{expense.description}</div>
                  <div className="mt-0.5 text-[12.5px] text-sub">
                    {formatDate(expense.expense_date)} · {expense.category}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 text-right">
                  <div className="text-[13.5px] font-bold text-ink">{formatCurrency(expense.amount)}</div>
                  <Badge status={aggregatePaymentStatus(statuses)} />
                </div>
              </Link>
            );
          })}
          {(expenses ?? []).length === 0 && (
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
          {(reports ?? []).map((report) => (
            <div
              key={report.id}
              className="flex items-center justify-between gap-3 border-b border-border py-2.5 last:border-b-0"
            >
              <div>
                <div className="text-sm font-semibold text-ink">{report.title}</div>
                <div className="mt-0.5 text-[12.5px] text-sub">
                  {report.unit_label} · {formatDate(report.created_at)}
                </div>
              </div>
              <Badge status={report.status as StatusLabel} />
            </div>
          ))}
          {(reports ?? []).length === 0 && (
            <p className="py-6 text-center text-sm text-sub">Nessuna segnalazione aperta.</p>
          )}
        </Panel>
      </div>
    </div>
  );
}
