import type {
  AppUser,
  DocumentItem,
  Expense,
  Notification,
  Report,
  Unit,
} from "./types";

export const units: Unit[] = [
  { id: 1, unit: "Interno 1", owner: "Rossi Mario", floor: "Piano 1", quota: "4,2%", status: "Pagato" },
  { id: 2, unit: "Interno 2", owner: "Bianchi Laura", floor: "Piano 1", quota: "4,2%", status: "Pagato" },
  { id: 3, unit: "Interno 3", owner: "Verdi Giuseppe", floor: "Piano 2", quota: "4,5%", status: "In attesa" },
  { id: 4, unit: "Interno 4", owner: "Ferrari Anna", floor: "Piano 2", quota: "4,5%", status: "Pagato" },
  { id: 5, unit: "Interno 5", owner: "Colombo Luca", floor: "Piano 3", quota: "4,8%", status: "Scaduto" },
  { id: 6, unit: "Interno 6", owner: "Ricci Sara", floor: "Piano 3", quota: "4,8%", status: "Pagato" },
  { id: 7, unit: "Interno 7", owner: "Marino Paolo", floor: "Piano 4", quota: "5,0%", status: "Pagato" },
  { id: 8, unit: "Interno 8", owner: "Greco Elena", floor: "Piano 4", quota: "5,0%", status: "In attesa" },
  { id: 9, unit: "Negozio A", owner: "Bruno Immobiliare Srl", floor: "Piano T", quota: "3,1%", status: "Pagato" },
  { id: 10, unit: "Negozio B", owner: "Vacante", floor: "Piano T", quota: "3,1%", status: "Vacante" },
];

export const expenses: Expense[] = [
  { id: 1, dateLabel: "15 ago 2026", description: "Manutenzione ascensore", category: "Manutenzione", amountLabel: "€1.240,00", status: "Pagato" },
  { id: 2, dateLabel: "10 ago 2026", description: "Pulizia scale", category: "Pulizie", amountLabel: "€380,00", status: "Pagato" },
  { id: 3, dateLabel: "05 ago 2026", description: "Assicurazione stabile", category: "Assicurazione", amountLabel: "€2.150,00", status: "In attesa" },
  { id: 4, dateLabel: "28 lug 2026", description: "Riparazione cancello", category: "Manutenzione", amountLabel: "€610,00", status: "Pagato" },
  { id: 5, dateLabel: "20 lug 2026", description: "Bolletta luce comuni", category: "Utenze", amountLabel: "€340,00", status: "Scaduto" },
  { id: 6, dateLabel: "15 lug 2026", description: "Compenso amministratore", category: "Amministrazione", amountLabel: "€900,00", status: "Pagato" },
  { id: 7, dateLabel: "10 lug 2026", description: "Disinfestazione", category: "Manutenzione", amountLabel: "€280,00", status: "Pagato" },
  { id: 8, dateLabel: "01 lug 2026", description: "Verifica impianto antincendio", category: "Manutenzione", amountLabel: "€520,00", status: "In attesa" },
];

export const reports: Report[] = [
  { id: 1, title: "Perdita acqua tubazione garage", unitLabel: "Interno 5", dateLabel: "12 ago 2026", status: "In lavorazione", assignee: "Idraulica Rossi" },
  { id: 2, title: "Luce scale pianerottolo 2 non funziona", unitLabel: "Interno 3", dateLabel: "10 ago 2026", status: "Aperta", assignee: "non assegnato" },
  { id: 3, title: "Citofono guasto ingresso", unitLabel: "Parti comuni", dateLabel: "08 ago 2026", status: "Risolta", assignee: "Elettricista Bianchi" },
  { id: 4, title: "Infiltrazione tetto", unitLabel: "Interno 8", dateLabel: "05 ago 2026", status: "Aperta", assignee: "non assegnato" },
  { id: 5, title: "Cancello garage bloccato", unitLabel: "Parti comuni", dateLabel: "30 lug 2026", status: "Risolta", assignee: "Fabbro Verdi" },
  { id: 6, title: "Ascensore rumoroso", unitLabel: "Parti comuni", dateLabel: "25 lug 2026", status: "In lavorazione", assignee: "Ascensori Martini" },
];

export const documents: DocumentItem[] = [
  { id: 1, title: "Verbale assemblea ordinaria", typeLabel: "Verbale", dateLabel: "15 lug 2026" },
  { id: 2, title: "Regolamento condominiale", typeLabel: "Regolamento", dateLabel: "01 gen 2024" },
  { id: 3, title: "Bilancio consuntivo 2025", typeLabel: "Bilancio", dateLabel: "30 apr 2026" },
  { id: 4, title: "Preventivo lavori facciata", typeLabel: "Preventivo", dateLabel: "20 giu 2026" },
  { id: 5, title: "Polizza assicurativa 2026", typeLabel: "Assicurazione", dateLabel: "10 gen 2026" },
  { id: 6, title: "Planimetria stabile", typeLabel: "Planimetria", dateLabel: "05 mar 2020" },
];

export const notifications: Notification[] = [
  { id: 1, text: "Nuova segnalazione: Perdita acqua garage", timeLabel: "2h fa", unread: true },
  { id: 2, text: "Pagamento ricevuto — Interno 1", timeLabel: "5h fa", unread: true },
  { id: 3, text: "Documento caricato: Bilancio consuntivo 2025", timeLabel: "1g fa", unread: false },
  { id: 4, text: "Promemoria: Assemblea ordinaria il 20 set", timeLabel: "1g fa", unread: true },
  { id: 5, text: "Segnalazione risolta: Citofono ingresso", timeLabel: "2g fa", unread: false },
  { id: 6, text: "Nuovo commento su Riparazione cancello", timeLabel: "3g fa", unread: false },
  { id: 7, text: "Fattura in scadenza: Assicurazione stabile", timeLabel: "4g fa", unread: false },
];

export const appUsers: AppUser[] = [
  { id: 1, name: "Marco Codeluppi", roleLabel: "Amministratore" },
  { id: 2, name: "Rossi Mario", roleLabel: "Residente · Interno 1" },
];

export const currentUser = {
  name: "Marco Codeluppi",
  email: "m.codeluppi@residencevalentina.it",
  phone: "+39 059 123 4567",
  roleLabel: "Amministratore condominio",
};

export const kpis = [
  { label: "Saldo cassa", value: "€48.230,50", sub: "Al 12 agosto 2026" },
  { label: "Prossima scadenza", value: "Assemblea ordinaria", sub: "20 settembre 2026" },
  { label: "Unità gestite", value: "24 unità", sub: "21 occupate · 3 vacanti" },
];
