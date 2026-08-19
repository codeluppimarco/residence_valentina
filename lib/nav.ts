export type NavItem = {
  href: string;
  label: string;
};

export const navGeneral: NavItem[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/units", label: "Unità" },
  { href: "/expenses", label: "Spese & pagamenti" },
  { href: "/cash-ledger", label: "Registro di cassa" },
  { href: "/events", label: "Eventi" },
  { href: "/reports", label: "Segnalazioni" },
  { href: "/documents", label: "Documenti" },
];

export const navAccount: NavItem[] = [
  { href: "/settings", label: "Impostazioni" },
  { href: "/profile", label: "Profilo" },
];

export function isNavItemActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getPageTitle(pathname: string): string {
  if (pathname === "/units") return "Unità immobiliari";
  if (pathname === "/expenses/new") return "Nuova spesa";
  if (pathname.startsWith("/expenses/")) return "Dettaglio spesa";
  if (pathname.startsWith("/expenses")) return "Spese & pagamenti";
  if (pathname.startsWith("/cash-ledger")) return "Registro di cassa";
  if (pathname.startsWith("/events")) return "Eventi";
  if (pathname.startsWith("/reports")) return "Segnalazioni";
  if (pathname.startsWith("/documents")) return "Documenti & bacheca";
  if (pathname.startsWith("/settings")) return "Impostazioni";
  if (pathname.startsWith("/profile")) return "Profilo";
  if (pathname.startsWith("/notifications")) return "Notifiche";
  return "Dashboard";
}
