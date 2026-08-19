-- Eventi generici del condominio (assemblee, scadenze, manutenzioni
-- programmate, altro) — sostituisce i campi next_assembly_title/
-- next_assembly_date di config, che potevano rappresentare un solo evento
-- futuro senza storico. La dashboard mostra come "Prossima scadenza" il
-- primo evento futuro per data, calcolato con una query, non un campo fisso.

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_date date not null,
  event_type text not null default 'altro' check (
    event_type in ('assemblea', 'scadenza', 'manutenzione', 'altro')
  ),
  description text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index events_event_date_idx on public.events (event_date);

create trigger events_set_updated_at
  before update on public.events
  for each row execute function public.handle_updated_at();

alter table public.events enable row level security;

create policy "Admin full access on events"
  on public.events for all
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

create policy "Revisore can view events"
  on public.events for select
  using (public.current_role() = 'revisore');

create policy "Condomino can view events"
  on public.events for select
  using (public.current_role() = 'condomino');

-- next_assembly_* erano scritti solo da questa app (nessuna migrazione dati
-- necessaria verso "events": in produzione andrebbe copiato manualmente se
-- valorizzato prima di questa migration).
alter table public.config
  drop column next_assembly_title,
  drop column next_assembly_date;
