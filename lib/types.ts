export type StatusLabel =
  | "Pagato"
  | "In attesa"
  | "Scaduto"
  | "Aperta"
  | "In lavorazione"
  | "Risolta"
  | "Vacante";

export type Notification = {
  id: number;
  text: string;
  timeLabel: string;
  unread: boolean;
};

