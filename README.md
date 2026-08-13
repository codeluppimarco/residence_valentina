# residence_valentina

Applicazione web per l'amministrazione di un piccolo condominio: anagrafica unità, spese comuni con ripartizione automatica per millesimi, registro pagamenti e verbali/comunicazioni, con accesso segregato per ruolo (amministratore, revisore, condomino).

Questo documento descrive architettura, stack tecnologico, modello dei ruoli e modello dati. Non tratta il layout/UI, che segue un design system separato.

---

## 1. Obiettivo del progetto

- Dare all'amministratore uno strumento unico per gestire anagrafica, spese, pagamenti e verbali.
- Dare a ciascun condomino un accesso personale, in sola lettura, ai propri dati (quote, pagamenti, verbali/comunicazioni), senza vedere i dati di dettaglio delle altre unità.
- Restare su uno stack a costo zero per i volumi di un condominio piccolo (< 10 unità), scalabile senza riscritture se il numero di condomini o l'uso crescono.

---

## 2. Stack tecnologico

| Livello | Scelta | Perché |
|---|---|---|
| Frontend | **Next.js** (React, App Router, TypeScript) | Framework maturo, hosting gratuito nativo su Vercel, buon supporto SSR per non esporre dati sensibili lato client, integrazione diretta con Supabase. |
| Hosting frontend | **Vercel (piano Hobby, gratuito)** | Deploy automatico da GitHub, HTTPS e dominio incluso, sufficiente per il traffico di un condominio. |
| Backend / Database | **Supabase** (Postgres) | Già scelto. Fornisce anche autenticazione e permessi riga-per-riga (vedi §4), quindi non serve un backend separato da scrivere e mantenere. |
| Autenticazione | **Supabase Auth** (email + password, invito via email) | Ogni condomino ha un account personale; niente login condiviso. |
| Permessi | **Row Level Security (RLS) di Postgres**, gestita da Supabase | I permessi vivono nel database, non nel codice frontend: anche se qualcuno bypassasse l'interfaccia, le query restano vincolate al ruolo. |
| File/allegati (facoltativo, se servono in futuro scansioni di verbali, fatture, ecc.) | **Supabase Storage** | Incluso nello stesso progetto Supabase, stesso sistema di permessi. |

**Costo stimato:** €0/mese di infrastruttura. Unico costo opzionale: un dominio personalizzato (~15–20€/anno), se non si vuole usare il sottodominio gratuito di Vercel.

**Limite noto del piano gratuito Supabase:** un progetto senza richieste per 7 giorni consecutivi va in pausa automatica e va riattivato manualmente dal pannello. Per un'app usata con una certa regolarità (l'amministratore che registra spese, i condomini che consultano) è raramente un problema; se si vuole azzerare il rischio si può impostare un ping automatico periodico (gratuito) oppure passare al piano Pro (25$/mese) più avanti.

---

## 3. Ruoli e permessi

| Ruolo | Anagrafica | Spese | Pagamenti | Verbali |
|---|---|---|---|---|
| **Amministratore** | lettura/scrittura completa | lettura/scrittura completa | lettura/scrittura completa | lettura/scrittura completa |
| **Revisore / Consiglio** | sola lettura completa | sola lettura completa | sola lettura completa | lettura/scrittura |
| **Condomino** | sola lettura del proprio nominativo/unità | lettura dei totali e delle categorie di spesa (non del dettaglio di ripartizione altrui) | sola lettura della propria quota e del proprio stato pagamento | sola lettura |

Note:

- Ogni condomino vede **sempre** i propri dati completi (quota dovuta, importo pagato, storico), ma non lo stato di pagamento delle altre unità — solo l'aggregato del condominio (totale spese, totale incassato) se lo si ritiene opportuno mostrarlo.
- Il ruolo Revisore, incluso fin dalla prima versione, è pensato per un consigliere o revisore dei conti che deve vedere tutto ma non necessariamente modificare spese e pagamenti (può però intervenire sui verbali, tipicamente redatti insieme all'amministratore).
- I ruoli si possono estendere in futuro (es. "fornitore" con accesso a un solo documento) senza cambiare l'architettura: basta aggiungere un valore all'enum `role` e le relative policy RLS.

---

## 4. Modello dati (schema concettuale)

Tabelle principali su Postgres/Supabase:

- **`profiles`** — un profilo per ogni utente autenticato (collegato a `auth.users`). Contiene `role` (`admin` \| `revisore` \| `condomino`), `full_name`, `unit_id` (nullo per admin/revisore).
- **`units`** — le unità immobiliari: proprietario, piano, millesimi, numero di persone residenti (necessario per la ripartizione "a persona", vedi §4bis), stato attivo/non attivo.
- **`config`** — riga unica di configurazione del condominio, tra cui la modalità di ripartizione predefinita (vedi §4bis).
- **`expenses`** — le spese comuni: descrizione, categoria, importo, data, modalità di ripartizione usata (eredita quella predefinita da `config`, oppure può essere impostata diversamente per la singola spesa — utile per casi tipici come l'ascensore diviso solo tra i piani serviti).
- **`expense_shares`** — **la quota calcolata e congelata per ogni coppia unità/spesa**, generata automaticamente nel momento in cui la spesa viene creata. Non è un valore ricalcolato al volo: contiene sia la quota in euro sia il "dato di base" usato per calcolarla (i millesimi dell'unità in quel momento, oppure il numero di persone e il totale persone del condominio in quel momento, oppure il numero di unità attive in quel momento). Così, se in futuro cambiano i millesimi, il numero di residenti o il numero di unità, le spese già registrate restano invariate.
- **`payments`** — un record per ogni riga di `expense_shares`: stato pagamento, data pagamento. Fa riferimento alla quota già congelata, non la ricalcola.
- **`minutes`** *(verbali)* — titolo, data, testo, eventuale allegato.

Il controllo accessi vive nelle **policy RLS** di ciascuna tabella (es. su `payments`: un utente con ruolo `condomino` può fare `SELECT` solo dove `unit_id` corrisponde alla propria unità; un `admin` non ha restrizioni). La tabella `config` sarà scrivibile solo dal ruolo `admin`.

Lo schema SQL dettagliato (DDL + policy) lo preparo quando siamo pronti a impostare il progetto Supabase.

---

## 4bis. Configurazione e modalità di ripartizione delle spese

Il condominio avrà una sezione **Configurazione**, accessibile solo all'amministratore, che comprende:

- la **modalità di ripartizione predefinita** delle spese, con tre opzioni:

  | Modalità | Formula | Richiede |
  |---|---|---|
  | **A millesimi** | quota unità = importo spesa × (millesimi unità ÷ totale millesimi del condominio in quel momento) | i millesimi per unità (già previsti in Anagrafica) |
  | **A persona** | quota unità = importo spesa × (persone residenti nell'unità ÷ totale persone residenti nel condominio in quel momento) | il numero di persone residenti per unità (nuovo campo in Anagrafica) |
  | **A unità abitativa** | quota unità = importo spesa ÷ numero di unità attive in quel momento (ripartizione paritaria) | nessun dato aggiuntivo |

- eventuali altri parametri generali del condominio (es. nome, dati dell'amministratore, IBAN per i pagamenti) che aggiungeremo in base alle necessità.

Ogni volta che viene registrata una nuova spesa, il sistema applica la modalità attiva in quel momento, calcola la quota per ciascuna unità e la **congela** in `expense_shares` insieme al dato di base usato (millesimi, persone o conteggio unità). Cambiare in seguito la configurazione, i millesimi di un'unità o il numero di residenti non altera le spese già registrate — vale solo per quelle future.

Per spese non generali (es. l'ascensore ripartito solo tra chi lo usa) è possibile forzare, per la singola spesa, una modalità diversa da quella predefinita.

---

## 5. Autenticazione e onboarding condomini

1. L'amministratore crea l'unità in Anagrafica.
2. L'amministratore invita il condomino inserendo la sua email; Supabase Auth invia un link di invito.
3. Il condomino imposta la propria password al primo accesso.
4. Alla creazione dell'account viene generato automaticamente un `profiles` con ruolo `condomino` e collegato alla sua `unit_id`.

Non è previsto un login condiviso: ogni persona ha credenziali proprie, così è sempre tracciabile chi ha effettuato una determinata azione.

---

## 6. Struttura del progetto (indicativa)

```
condominio-app/
├─ app/                     # rotte Next.js (App Router)
│  ├─ (auth)/               # login, invito, reset password
│  ├─ (dashboard)/          # riepilogo, anagrafica, spese, pagamenti, verbali
│  └─ api/                  # eventuali route server-side (es. inviti)
├─ lib/
│  └─ supabase/             # client Supabase (browser + server)
├─ types/                   # tipi TypeScript generati dallo schema Supabase
├─ .env.local               # variabili d'ambiente (non versionato)
└─ README.md
```

Il layout/UI seguirà il design system già definito e non è oggetto di questo documento.

---

## 7. Variabili d'ambiente

| Variabile | Ambito | Descrizione |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | client + server | URL del progetto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client + server | Chiave pubblica, usata insieme alle policy RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | solo server | Usata solo per operazioni amministrative (es. invio inviti); non deve mai essere esposta al client |

---

## 8. Setup e deploy (panoramica)

1. Creare un progetto su [supabase.com](https://supabase.com) (piano gratuito, regione UE per motivi di trattamento dati).
2. Applicare lo schema (tabelle + policy RLS) al database.
3. Configurare le variabili d'ambiente in locale (`.env.local`) e su Vercel.
4. Collegare la repository GitHub del progetto a Vercel: ogni push sul branch principale genera un deploy automatico.
5. Invitare il primo utente amministratore da Supabase Auth.

---

## 9. Privacy e responsabilità

Poiché l'applicazione tratta dati personali ed economici dei condomini, l'amministratore assume il ruolo di titolare del trattamento (GDPR). In fase di lancio andranno predisposti:

- un'informativa privacy sintetica per i condomini,
- la scelta della regione dati Supabase in UE,
- credenziali robuste e, se possibile, autenticazione a due fattori per l'account amministratore.

---

## 10. Possibili estensioni future

- Notifiche via email quando viene registrata una nuova spesa o pubblicato un verbale.
- Esportazione PDF di rendiconti e riepiloghi.
- Allegati (fatture, preventivi) tramite Supabase Storage.
- Supporto multi-condominio per amministratori che gestiscono più stabili.

---

*Documento di architettura — non contiene ancora il codice applicativo né lo schema SQL definitivo. Con tutte le decisioni di questa fase confermate, il prossimo passo è preparare lo schema SQL (tabelle, policy RLS) per il progetto Supabase.*
