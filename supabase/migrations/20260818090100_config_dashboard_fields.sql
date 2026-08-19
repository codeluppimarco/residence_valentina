-- Saldo cassa e prossima scadenza mostrati come KPI in dashboard: non
-- esiste un registro cassa/eventi nello schema, quindi restano campi
-- aggiornati manualmente dall'admin (da Impostazioni), non calcolati.

alter table public.config
  add column cash_balance numeric(12, 2) not null default 0,
  add column next_assembly_title text,
  add column next_assembly_date date;
