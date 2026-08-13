import type { StatusLabel } from "./types";

export const statusBadgeClasses: Record<StatusLabel, string> = {
  Pagato: "bg-success-soft text-success",
  "In attesa": "bg-warn-soft text-warn",
  Scaduto: "bg-danger-soft text-danger",
  Aperta: "bg-danger-soft text-danger",
  "In lavorazione": "bg-warn-soft text-warn",
  Risolta: "bg-success-soft text-success",
  Vacante: "bg-neutral-soft text-neutral",
};
