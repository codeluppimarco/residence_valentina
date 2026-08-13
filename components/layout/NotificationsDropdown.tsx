import Link from "next/link";
import type { Notification } from "@/lib/types";
import { cn } from "@/lib/cn";

type NotificationsDropdownProps = {
  notifications: Notification[];
  onNavigate: () => void;
};

export function NotificationsDropdown({ notifications, onNavigate }: NotificationsDropdownProps) {
  return (
    <div className="absolute right-0 top-[46px] w-80 overflow-hidden rounded-card-sm border border-border bg-surface shadow-dropdown">
      <div className="border-b border-border px-4 py-3 text-sm font-bold text-ink">Notifiche</div>
      {notifications.slice(0, 4).map((n) => (
        <div key={n.id} className="flex gap-2.5 border-b border-border px-4 py-2.5 last:border-b-0">
          <span
            className={cn(
              "mt-1.5 h-[7px] w-[7px] shrink-0 rounded-pill",
              n.unread ? "bg-primary" : "bg-border",
            )}
          />
          <div>
            <div className={cn("text-sm text-ink", n.unread ? "font-semibold" : "font-medium")}>{n.text}</div>
            <div className="mt-0.5 text-xs text-sub">{n.timeLabel}</div>
          </div>
        </div>
      ))}
      <Link
        href="/notifications"
        onClick={onNavigate}
        className="block w-full px-4 py-3 text-center text-[13.5px] font-bold text-primary"
      >
        Vedi tutte
      </Link>
    </div>
  );
}
