import Link from "next/link";
import { LogoBadge } from "@/components/ui/LogoBadge";
import { cn } from "@/lib/cn";
import { isNavItemActive, navAccount, navGeneral, type NavItem } from "@/lib/nav";

type SidebarProps = {
  pathname: string;
  open: boolean;
  onNavigate: () => void;
};

function NavLink({ item, active, onNavigate }: { item: NavItem; active: boolean; onNavigate: () => void }) {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "mx-2 my-px flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-[14.5px]",
        active ? "bg-primary-soft font-bold text-primary-dark" : "font-medium text-sub hover:bg-bg",
      )}
    >
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-pill", active ? "bg-primary" : "bg-border")} />
      {item.label}
    </Link>
  );
}

export function Sidebar({ pathname, open, onNavigate }: SidebarProps) {
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-[260px] overflow-y-auto border-r border-border bg-surface pb-6 transition-transform duration-[220ms] ease-in-out",
        open ? "translate-x-0" : "-translate-x-full",
        "lg:sticky lg:top-0 lg:h-screen lg:w-[248px] lg:shrink-0 lg:translate-x-0",
      )}
    >
      <div className="flex items-center gap-2.5 px-4 py-5">
        <LogoBadge size="sm" />
        <div>
          <div className="text-[14.5px] font-bold leading-tight text-ink">Residence Valentina</div>
          <div className="text-xs text-sub">Amministrazione</div>
        </div>
      </div>

      <div className="px-5 pb-1.5 pt-3.5 text-[11px] font-bold uppercase tracking-wider text-sub">Generale</div>
      {navGeneral.map((item) => (
        <NavLink key={item.href} item={item} active={isNavItemActive(pathname, item.href)} onNavigate={onNavigate} />
      ))}

      <div className="px-5 pb-1.5 pt-3.5 text-[11px] font-bold uppercase tracking-wider text-sub">Account</div>
      {navAccount.map((item) => (
        <NavLink key={item.href} item={item} active={isNavItemActive(pathname, item.href)} onNavigate={onNavigate} />
      ))}
    </aside>
  );
}
