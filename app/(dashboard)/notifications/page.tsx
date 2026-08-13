import { Panel } from "@/components/ui/Panel";
import { cn } from "@/lib/cn";
import { notifications } from "@/lib/mock-data";

export default function NotificationsPage() {
  return (
    <div>
      <div className="mb-5 text-[22px] font-bold text-ink">Notifiche</div>

      <Panel className="p-0">
        {notifications.map((n) => (
          <div key={n.id} className="flex gap-3 border-b border-border px-[18px] py-3.5 last:border-b-0">
            <span
              className={cn("mt-1.5 h-[7px] w-[7px] shrink-0 rounded-pill", n.unread ? "bg-primary" : "bg-border")}
            />
            <div>
              <div className={cn("text-sm text-ink", n.unread ? "font-semibold" : "font-medium")}>{n.text}</div>
              <div className="mt-0.5 text-xs text-sub">{n.timeLabel}</div>
            </div>
          </div>
        ))}
        {notifications.length === 0 && (
          <p className="py-6 text-center text-sm text-sub">Nessuna notifica.</p>
        )}
      </Panel>
    </div>
  );
}
