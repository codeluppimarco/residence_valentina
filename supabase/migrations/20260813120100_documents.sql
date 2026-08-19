-- Documenti & bacheca — libreria file generica (Regolamento, Bilancio,
-- Preventivo, Assicurazione, Planimetria, Altro, e copie file dei Verbali).
-- Tabella distinta da "minutes": "minutes" è il verbale governativo con
-- testo strutturato (scritto da admin/revisore, letto da tutti, vedi README
-- §3); "documents" è una libreria di file scaricabili, senza corpo testuale,
-- non prevista nel modello dati del README ma presente nella UI già
-- costruita (schermata "Documenti & bacheca"). "Verbale" resta anche uno
-- dei tipi selezionabili qui per chi vuole caricare la scansione di un
-- verbale come file, senza che questo sostituisca la riga strutturata in
-- "minutes".

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  doc_type text not null check (
    doc_type in ('Verbale', 'Regolamento', 'Bilancio', 'Preventivo', 'Assicurazione', 'Planimetria', 'Altro')
  ),
  doc_date date not null default current_date,
  storage_path text not null,              -- riferimento a Supabase Storage, bucket "documents"
  uploaded_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index documents_doc_date_idx on public.documents (doc_date);
create index documents_doc_type_idx on public.documents (doc_type);

create trigger documents_set_updated_at
  before update on public.documents
  for each row execute function public.handle_updated_at();

alter table public.documents enable row level security;

create policy "Admin full access on documents"
  on public.documents for all
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

create policy "Revisore can view documents"
  on public.documents for select
  using (public.current_role() = 'revisore');

create policy "Condomino can view documents"
  on public.documents for select
  using (public.current_role() = 'condomino');

-- ============================================================================
-- STORAGE — file della libreria documenti
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

create policy "Admin full access on documents bucket"
  on storage.objects for all
  using (bucket_id = 'documents' and public.current_role() = 'admin')
  with check (bucket_id = 'documents' and public.current_role() = 'admin');

create policy "Authenticated users can read documents bucket"
  on storage.objects for select
  using (bucket_id = 'documents' and public.current_role() is not null);
