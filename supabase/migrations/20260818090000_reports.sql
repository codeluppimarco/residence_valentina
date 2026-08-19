-- Segnalazioni (manutenzione/problemi segnalati dai residenti). Non prevista
-- nel modello dati del README (come "documents"), aggiunta per coprire la
-- schermata "Segnalazioni" già presente nel frontend.
--
-- unit_label è testo libero (non FK a units) perché una segnalazione può
-- riferirsi a "Parti comuni" oltre che a una singola unità, coerente col
-- form già costruito nel frontend ("Es. Interno 5 o Parti comuni").
-- Stesso discorso per assignee: nome libero, nessuna tabella fornitori
-- nello schema attuale.
--
-- A differenza di "documents" (solo admin scrive), qui il condomino può
-- creare segnalazioni (è il punto della funzionalità: "segnalato dai
-- residenti"), ma non modificarle/cancellarle dopo la creazione — la
-- gestione del ciclo di vita (stato, assegnazione, chiusura) resta
-- all'admin.

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  unit_label text not null default 'Parti comuni',
  description text,
  status text not null default 'Aperta' check (status in ('Aperta', 'In lavorazione', 'Risolta')),
  assignee text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index reports_status_idx on public.reports (status);
create index reports_created_at_idx on public.reports (created_at);

create trigger reports_set_updated_at
  before update on public.reports
  for each row execute function public.handle_updated_at();

alter table public.reports enable row level security;

create policy "Admin full access on reports"
  on public.reports for all
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

create policy "Revisore can view reports"
  on public.reports for select
  using (public.current_role() = 'revisore');

create policy "Condomino can view reports"
  on public.reports for select
  using (public.current_role() = 'condomino');

create policy "Condomino can create reports"
  on public.reports for insert
  with check (public.current_role() = 'condomino');
