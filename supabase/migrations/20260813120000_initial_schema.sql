-- Residence Valentina — schema iniziale
-- Tabelle, RLS e trigger per anagrafica unità, spese/ripartizione, pagamenti e verbali.
-- Vedi README.md §3, §4, §4bis per il contesto di dominio.

-- ============================================================================
-- ENUM
-- ============================================================================

create type public.app_role as enum ('admin', 'revisore', 'condomino');
create type public.app_split_method as enum ('millesimi', 'persone', 'unita');
create type public.app_payment_status as enum ('pagato', 'in_attesa', 'scaduto');

-- ============================================================================
-- FUNZIONI DI SUPPORTO
-- ============================================================================

-- updated_at automatico su ogni update
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Ruolo e unità dell'utente corrente, usati nelle policy RLS di più tabelle.
-- security definer: leggono profiles bypassando la RLS di profiles stessa,
-- per evitare che le policy di "profiles" debbano fare una sotto-query su
-- "profiles" per sapere se il chiamante è admin (schema più semplice da
-- ragionare e riutilizzabile su tutte le altre tabelle). Restituiscono
-- sempre e solo dati relativi ad auth.uid(), quindi non ampliano l'accesso.
-- language plpgsql (non sql): il corpo di una funzione "sql" viene
-- risolto contro il catalogo già in fase di CREATE FUNCTION, quindi
-- fallirebbe qui perché "profiles" non esiste ancora a questo punto del
-- file. plpgsql invece compila il corpo alla prima chiamata, quando
-- "profiles" esiste già.
create or replace function public.current_role()
returns public.app_role
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  return (select role from public.profiles where id = auth.uid());
end;
$$;

create or replace function public.current_unit_id()
returns uuid
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  return (select unit_id from public.profiles where id = auth.uid());
end;
$$;

-- ============================================================================
-- UNITS — anagrafica unità immobiliari
-- ============================================================================

create table public.units (
  id uuid primary key default gen_random_uuid(),
  label text not null,                     -- es. "Interno 1", "Negozio A"
  owner_name text not null,
  floor text,                              -- es. "Piano 2", "Piano T"
  millesimi numeric(7,3) not null default 0 check (millesimi >= 0),
  resident_count integer not null default 0 check (resident_count >= 0),
  is_active boolean not null default true, -- "attivo/non attivo" per README §4
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index units_is_active_idx on public.units (is_active);

create trigger units_set_updated_at
  before update on public.units
  for each row execute function public.handle_updated_at();

alter table public.units enable row level security;

create policy "Admin full access on units"
  on public.units for all
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

create policy "Revisore can view units"
  on public.units for select
  using (public.current_role() = 'revisore');

create policy "Condomino can view own unit"
  on public.units for select
  using (public.current_role() = 'condomino' and id = public.current_unit_id());

-- ============================================================================
-- PROFILES — un profilo per utente Supabase Auth
-- ============================================================================

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.app_role not null default 'condomino',
  full_name text not null,
  phone text,                              -- non nel modello README, usato dalla UI Profilo
  unit_id uuid references public.units (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_unit_required_for_condomino
    check (role <> 'condomino' or unit_id is not null)
);

create index profiles_unit_id_idx on public.profiles (unit_id);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

alter table public.profiles enable row level security;

create policy "Admin full access on profiles"
  on public.profiles for all
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

create policy "Revisore can view profiles"
  on public.profiles for select
  using (public.current_role() = 'revisore');

create policy "Users can view own profile"
  on public.profiles for select
  using (id = auth.uid());

create policy "Users can update own name and phone"
  on public.profiles for update
  using (id = auth.uid())
  with check (
    id = auth.uid()
    -- non può auto-promuoversi né cambiare unità: role/unit_id restano quelli già assegnati
    and role = public.current_role()
    and unit_id is not distinct from public.current_unit_id()
  );

-- Crea automaticamente il profilo quando un nuovo utente si registra
-- (invito via Supabase Auth, vedi README §5). L'admin, in fase di invito,
-- passa full_name / unit_id / role nei metadata dell'utente invitato.
-- security definer: al momento dell'insert nessuna sessione ha ancora i
-- permessi per scrivere su profiles (nessuna policy insert è concessa ai
-- client), quindi il trigger deve poter bypassare la RLS.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name, unit_id)
  values (
    new.id,
    coalesce((new.raw_user_meta_data ->> 'role')::public.app_role, 'condomino'),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    nullif(new.raw_user_meta_data ->> 'unit_id', '')::uuid
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- CONFIG — riga singola di configurazione del condominio
-- ============================================================================

create table public.config (
  id integer primary key default 1 check (id = 1), -- forza una sola riga
  condo_name text not null default 'Residence Valentina',
  address text,
  tax_code text,
  iban text,
  default_split_method public.app_split_method not null default 'millesimi',
  updated_at timestamptz not null default now()
);

create trigger config_set_updated_at
  before update on public.config
  for each row execute function public.handle_updated_at();

insert into public.config (id) values (1);

alter table public.config enable row level security;

create policy "Authenticated users can view config"
  on public.config for select
  using (public.current_role() is not null);

create policy "Admin can update config"
  on public.config for update
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

-- niente insert/delete: la riga singola è seminata da questa migration e basta.

-- ============================================================================
-- EXPENSES — spese comuni
-- ============================================================================

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  description text not null,
  category text not null check (
    category in ('Manutenzione', 'Pulizie', 'Utenze', 'Assicurazione', 'Amministrazione')
  ),
  amount numeric(10,2) not null check (amount > 0),
  expense_date date not null,
  split_method public.app_split_method not null,
  notes text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index expenses_expense_date_idx on public.expenses (expense_date);
create index expenses_created_by_idx on public.expenses (created_by);

create trigger expenses_set_updated_at
  before update on public.expenses
  for each row execute function public.handle_updated_at();

alter table public.expenses enable row level security;

create policy "Admin full access on expenses"
  on public.expenses for all
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

create policy "Revisore can view expenses"
  on public.expenses for select
  using (public.current_role() = 'revisore');

create policy "Condomino can view expenses"
  on public.expenses for select
  using (public.current_role() = 'condomino');

-- ============================================================================
-- EXPENSE_SHARES — quota congelata per unità/spesa
-- ============================================================================

create table public.expense_shares (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid not null references public.expenses (id) on delete cascade,
  unit_id uuid not null references public.units (id) on delete cascade,
  amount numeric(10,2) not null check (amount >= 0),
  -- Dato di base congelato al momento del calcolo (README §4bis), es.:
  --   {"method":"millesimi","unit_millesimi":4.2,"total_millesimi":1000}
  --   {"method":"persone","unit_residents":2,"total_residents":40}
  --   {"method":"unita","active_units_count":24}
  basis jsonb not null,
  created_at timestamptz not null default now(),
  constraint expense_shares_unique_per_unit unique (expense_id, unit_id),
  constraint expense_shares_basis_has_method check (
    basis ->> 'method' in ('millesimi', 'persone', 'unita')
  )
);

create index expense_shares_expense_id_idx on public.expense_shares (expense_id);
create index expense_shares_unit_id_idx on public.expense_shares (unit_id);

alter table public.expense_shares enable row level security;

create policy "Admin full access on expense_shares"
  on public.expense_shares for all
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

create policy "Revisore can view expense_shares"
  on public.expense_shares for select
  using (public.current_role() = 'revisore');

create policy "Condomino can view own unit expense_shares"
  on public.expense_shares for select
  using (public.current_role() = 'condomino' and unit_id = public.current_unit_id());

-- ============================================================================
-- PAYMENTS — stato di pagamento per ogni expense_share
-- ============================================================================

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  expense_share_id uuid not null unique references public.expense_shares (id) on delete cascade,
  status public.app_payment_status not null default 'in_attesa',
  paid_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payments_paid_at_requires_status
    check (status <> 'pagato' or paid_at is not null)
);

create trigger payments_set_updated_at
  before update on public.payments
  for each row execute function public.handle_updated_at();

alter table public.payments enable row level security;

create policy "Admin full access on payments"
  on public.payments for all
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

create policy "Revisore can view payments"
  on public.payments for select
  using (public.current_role() = 'revisore');

create policy "Condomino can view own unit payments"
  on public.payments for select
  using (
    public.current_role() = 'condomino'
    and exists (
      select 1
      from public.expense_shares es
      where es.id = payments.expense_share_id
        and es.unit_id = public.current_unit_id()
    )
  );

-- ============================================================================
-- MINUTES — verbali e comunicazioni
-- ============================================================================

create table public.minutes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  minute_date date not null,
  body text not null,
  attachment_path text,                    -- riferimento a Supabase Storage, bucket "minutes"
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index minutes_minute_date_idx on public.minutes (minute_date);

create trigger minutes_set_updated_at
  before update on public.minutes
  for each row execute function public.handle_updated_at();

alter table public.minutes enable row level security;

create policy "Admin full access on minutes"
  on public.minutes for all
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

create policy "Revisore can view minutes"
  on public.minutes for select
  using (public.current_role() = 'revisore');

create policy "Revisore can create minutes"
  on public.minutes for insert
  with check (public.current_role() = 'revisore');

create policy "Revisore can update minutes"
  on public.minutes for update
  using (public.current_role() = 'revisore')
  with check (public.current_role() = 'revisore');

-- delete riservato all'admin (nessuna policy delete per revisore)

create policy "Condomino can view minutes"
  on public.minutes for select
  using (public.current_role() = 'condomino');

-- ============================================================================
-- STORAGE — allegati verbali
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('minutes', 'minutes', false)
on conflict (id) do nothing;

create policy "Admin full access on minutes bucket"
  on storage.objects for all
  using (bucket_id = 'minutes' and public.current_role() = 'admin')
  with check (bucket_id = 'minutes' and public.current_role() = 'admin');

create policy "Revisore can upload to minutes bucket"
  on storage.objects for insert
  with check (bucket_id = 'minutes' and public.current_role() = 'revisore');

create policy "Authenticated users can read minutes bucket"
  on storage.objects for select
  using (bucket_id = 'minutes' and public.current_role() is not null);
