-- ============================================================================
-- EXPENSES — allegati preventivo/fattura + stato "saldata al fornitore"
-- ============================================================================
-- settled_at è distinto da payments.status: quest'ultimo traccia se OGNI
-- unità ha versato la propria quota (entrata), settled_at traccia se
-- l'amministratore ha pagato il fornitore per l'intera spesa (uscita).
-- Sono due movimenti di cassa opposti collegati alla stessa spesa.

alter table public.expenses
  add column quote_path text,
  add column invoice_path text,
  add column settled_at date;

insert into storage.buckets (id, name, public)
values ('expense-attachments', 'expense-attachments', false)
on conflict (id) do nothing;

create policy "Admin full access on expense-attachments bucket"
  on storage.objects for all
  using (bucket_id = 'expense-attachments' and public.current_role() = 'admin')
  with check (bucket_id = 'expense-attachments' and public.current_role() = 'admin');

create policy "Authenticated users can read expense-attachments bucket"
  on storage.objects for select
  using (bucket_id = 'expense-attachments' and public.current_role() is not null);

-- ============================================================================
-- CASH_LEDGER — registro di cassa
-- ============================================================================
-- Righe generate automaticamente (dall'app, non da trigger DB — coerente con
-- la scelta di tenere in TypeScript la logica di dominio, vedi expense_shares):
--   - entrata quando un payments.status passa a 'pagato' (quota condomino)
--   - uscita quando un'expense viene segnata come saldata al fornitore
-- Più eventuali voci manuali (es. interessi bancari) non collegate a nulla.
-- amount: positivo = entrata, negativo = uscita.

create table public.cash_ledger (
  id uuid primary key default gen_random_uuid(),
  entry_date date not null default current_date,
  description text not null,
  amount numeric(12, 2) not null check (amount <> 0),
  expense_id uuid references public.expenses (id) on delete set null,
  payment_id uuid references public.payments (id) on delete set null,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint cash_ledger_single_link check (expense_id is null or payment_id is null)
);

create index cash_ledger_entry_date_idx on public.cash_ledger (entry_date);
create index cash_ledger_expense_id_idx on public.cash_ledger (expense_id);
create index cash_ledger_payment_id_idx on public.cash_ledger (payment_id);

alter table public.cash_ledger enable row level security;

create policy "Admin full access on cash_ledger"
  on public.cash_ledger for all
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

create policy "Revisore can view cash_ledger"
  on public.cash_ledger for select
  using (public.current_role() = 'revisore');

-- Il condomino NON ha accesso diretto al registro: le voci di entrata
-- espongono quando/quanto hanno pagato le ALTRE unità, dato non suo
-- (README §3: "non del dettaglio di ripartizione altrui"). Il saldo
-- aggregato resta visibile solo all'admin per ora; una vista/API dedicata
-- per un eventuale saldo cassa condomino andrebbe aggiunta a parte.

-- config.cash_balance era un numero digitato a mano: ora il saldo è
-- calcolato come somma del registro, quindi il campo diventa ridondante.
alter table public.config drop column cash_balance;
