import { Panel } from "./Panel";

type KpiCardProps = {
  label: string;
  value: string;
  sub: string;
};

export function KpiCard({ label, value, sub }: KpiCardProps) {
  return (
    <Panel>
      <div className="text-[13px] font-semibold text-sub">{label}</div>
      <div className="mt-2 text-2xl font-bold text-ink">{value}</div>
      <div className="mt-1.5 text-[12.5px] text-sub">{sub}</div>
    </Panel>
  );
}
