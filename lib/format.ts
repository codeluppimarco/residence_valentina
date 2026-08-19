export function formatCurrency(amount: number): string {
  return amount.toLocaleString("it-IT", { style: "currency", currency: "EUR" });
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" });
}

const splitMethodLabels = {
  millesimi: "millesimi di proprietà",
  persone: "numero di persone residenti",
  unita: "parti uguali tra le unità",
} as const;

export function splitMethodLabel(method: keyof typeof splitMethodLabels): string {
  return splitMethodLabels[method];
}

const roleLabels = {
  admin: "Amministratore condominio",
  revisore: "Revisore / Consiglio",
  condomino: "Residente",
} as const;

export function roleLabel(role: keyof typeof roleLabels): string {
  return roleLabels[role];
}

const eventTypeLabels = {
  assemblea: "Assemblea",
  scadenza: "Scadenza",
  manutenzione: "Manutenzione",
  altro: "Altro",
} as const;

export function eventTypeLabel(type: string): string {
  return type in eventTypeLabels ? eventTypeLabels[type as keyof typeof eventTypeLabels] : type;
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
