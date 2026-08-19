import type { Notification } from "./types";

export const notifications: Notification[] = [
  { id: 1, text: "Nuova segnalazione: Perdita acqua garage", timeLabel: "2h fa", unread: true },
  { id: 2, text: "Pagamento ricevuto — Interno 1", timeLabel: "5h fa", unread: true },
  { id: 3, text: "Documento caricato: Bilancio consuntivo 2025", timeLabel: "1g fa", unread: false },
  { id: 4, text: "Promemoria: Assemblea ordinaria il 20 set", timeLabel: "1g fa", unread: true },
  { id: 5, text: "Segnalazione risolta: Citofono ingresso", timeLabel: "2g fa", unread: false },
  { id: 6, text: "Nuovo commento su Riparazione cancello", timeLabel: "3g fa", unread: false },
  { id: 7, text: "Fattura in scadenza: Assicurazione stabile", timeLabel: "4g fa", unread: false },
];
