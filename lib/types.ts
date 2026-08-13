export type StatusLabel =
  | "Pagato"
  | "In attesa"
  | "Scaduto"
  | "Aperta"
  | "In lavorazione"
  | "Risolta"
  | "Vacante";

export type Unit = {
  id: number;
  unit: string;
  owner: string;
  floor: string;
  quota: string;
  status: StatusLabel;
};

export type Expense = {
  id: number;
  dateLabel: string;
  description: string;
  category: string;
  amountLabel: string;
  status: StatusLabel;
};

export type Report = {
  id: number;
  title: string;
  unitLabel: string;
  dateLabel: string;
  status: StatusLabel;
  assignee: string;
};

export type DocumentItem = {
  id: number;
  title: string;
  typeLabel: string;
  dateLabel: string;
};

export type Notification = {
  id: number;
  text: string;
  timeLabel: string;
  unread: boolean;
};

export type AppUser = {
  id: number;
  name: string;
  roleLabel: string;
};

export type SplitMethod = "Unita" | "Persone" | "Millesimi";
