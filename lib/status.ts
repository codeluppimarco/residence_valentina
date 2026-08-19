import type { PaymentStatus } from "./db-types";
import type { StatusLabel } from "./types";

const paymentStatusLabels: Record<PaymentStatus, StatusLabel> = {
  pagato: "Pagato",
  in_attesa: "In attesa",
  scaduto: "Scaduto",
};

// Stato aggregato di una spesa: peggiore tra le quote (una sola scaduta o in
// attesa basta a non considerarla "Pagato"), dato che expenses non ha una
// colonna status propria — vedi nota in supabase/migrations.
export function aggregatePaymentStatus(statuses: PaymentStatus[]): StatusLabel {
  if (statuses.length === 0) return "In attesa";
  if (statuses.some((s) => s === "scaduto")) return "Scaduto";
  if (statuses.every((s) => s === "pagato")) return "Pagato";
  return "In attesa";
}

export function paymentStatusLabel(status: PaymentStatus): StatusLabel {
  return paymentStatusLabels[status];
}

export const statusBadgeClasses: Record<StatusLabel, string> = {
  Pagato: "bg-success-soft text-success",
  "In attesa": "bg-warn-soft text-warn",
  Scaduto: "bg-danger-soft text-danger",
  Aperta: "bg-danger-soft text-danger",
  "In lavorazione": "bg-warn-soft text-warn",
  Risolta: "bg-success-soft text-success",
  Vacante: "bg-neutral-soft text-neutral",
};
