# Handoff: Residence Valentina — Gestione Condominiale

## Overview
Layout responsive di una web application per la gestione di un condominio singolo ("Residence Valentina"), lato amministratore. Copre login, dashboard, gestione unità immobiliari, spese/pagamenti, segnalazioni di manutenzione, documenti/bacheca, impostazioni e profilo utente.

## About the Design Files
I file in questo bundle sono **riferimenti di design creati in HTML** — prototipi che mostrano aspetto e comportamento previsti, non codice di produzione da copiare direttamente. Il compito è **ricreare questi design HTML nell'ambiente di codice reale del progetto** (React, Vue, ecc. — o il framework più adatto se non esiste ancora una base) usandone pattern e librerie stabilite.

## Fidelity
**Alta fedeltà (hifi)** per struttura, gerarchia informativa, stati e interazioni. Colori/tipografia sono una direzione coerente (vedi Design Tokens) ma non vincolati a un design system esistente del cliente — possono essere adattati al sistema di design reale del prodotto se diverso.

## Screens / Views
Applicazione a singola pagina con sidebar di navigazione + area contenuto. Su schermi <1024px la sidebar diventa un drawer a scomparsa (hamburger in topbar) attivato da overlay.

### 1. Login
- **Purpose**: accesso amministratore.
- **Layout**: card centrata (max-width 380px) su sfondo neutro, flex column.
- **Componenti**: badge logo "RV" (48×48, radius 12), titolo, sottotitolo, campo email, campo password, bottone primario "Accedi" full-width, due link testuali ("Password dimenticata?", "Richiedi accesso residente").

### 2. Dashboard
- **Purpose**: overview giornaliera per l'amministratore.
- **Layout**: saluto + sottotitolo, riga di 3 KPI card (grid 3 colonne desktop, 1 colonna mobile), poi 2 colonne (1.3fr/1fr desktop, 1 colonna mobile): pannello "Spese recenti" (righe mini con importo+stato) e pannello "Segnalazioni aperte".
- **KPI**: Saldo cassa, Prossima scadenza, Unità gestite.

### 3. Unità immobiliari
- **Layout**: header con titolo+sottotitolo e bottone "+ Nuova unità"; tabella (grid 5 colonne: Unità, Proprietario, Piano, Quota millesimale, Stato) con badge di stato colorato.
- **Maschera "Nuova unità"** (modale): campi Unità, Proprietario, Piano, Quota millesimale, Stato (select).

### 4. Spese & pagamenti
- **Layout**: header con bottone "+ Nuova spesa"; tabella 5 colonne (Data, Descrizione, Categoria, Importo, Stato); riga cliccabile → Dettaglio spesa.
- **Dettaglio spesa**: back-link, 2 colonne (1.4fr/1fr): pannello principale con titolo/importo/stato/ripartizione/allegati + azioni (Modifica/Elimina); pannello "Cronologia" con timeline a pallini.
- **Maschera "Nuova spesa"**: form 2 colonne (1 su mobile) — Descrizione, Categoria (select), Importo, Data, Ripartizione (select: Unità/Persone/Millesimi, default preso da Impostazioni), Note (textarea full-width). Validazione: descrizione e importo obbligatori.

### 5. Segnalazioni
- **Layout**: header + bottone "+ Nuova segnalazione"; lista di card (titolo, badge stato, unità · data · assegnatario).
- **Maschera "Nuova segnalazione"**: Titolo, Unità/parti comuni, Descrizione (textarea).

### 6. Documenti & bacheca
- **Layout**: header + bottone "+ Carica documento"; grid di card documento (3 colonne desktop, 1 mobile) con chip tipo, titolo, data, bottone "Scarica".
- **Maschera "Carica documento"**: Titolo, Tipo (select), File (input file).

### 7. Impostazioni
- **Layout**: grid 2 colonne (1 su mobile) di pannelli: "Dati condominio" (nome, indirizzo, codice fiscale, numero di unità abitative), "Ripartizione spese condominiali" (3 opzioni radio: per unità abitativa / per numero di persone / per millesimi — determina il default nella maschera "Nuova spesa"), "Preferenze notifiche" (3 toggle), "Utenti e ruoli" (lista utenti + bottone "+ Nuovo utente").
- **Maschera "Nuovo utente"**: Nome completo, Ruolo (select Amministratore/Residente), Unità collegata.

### 8. Profilo
- **Layout**: card centrata con avatar iniziali, nome, ruolo, righe dato (email, telefono, condominio gestito), 2 bottoni secondari: "Modifica profilo", "Cambia password".
- **Maschere**: "Modifica profilo" (Nome, Email, Telefono) e "Cambia password" (Password attuale, Nuova password, Conferma) — entrambe validano i campi obbligatori.

### 9. Notifiche
- Dropdown rapido dalla campanella in topbar (ultime 4 + link "Vedi tutte") e vista a pagina intera con l'elenco completo, pallino colorato per non lette.

## Interactions & Behavior
- **Navigazione**: sidebar con 2 gruppi (Generale: Dashboard/Unità/Spese & pagamenti/Segnalazioni/Documenti; Account: Impostazioni/Profilo). Voce attiva = sfondo tinta primaria soft + testo bold.
- **Topbar**: hamburger (solo mobile) apre/chiude il drawer sidebar con backdrop scuro cliccabile per chiudere; campo ricerca (nascosto su mobile); campana notifiche con pallino rosso se ci sono non lette e dropdown; avatar con dropdown menu (Profilo, Impostazioni, Esci → torna a Login).
- **Modali**: overlay scuro cliccabile per chiudere, card con header (titolo + ×), area campi scrollabile, footer con Salva/Annulla sempre visibile (non scrolla via). Validazione minima con messaggio di errore inline prima del footer.
- **Responsive breakpoint**: 1024px. Sotto la soglia: sidebar diventa drawer overlay fissa (translateX show/hide, transizione 0.22s), topbar mostra hamburger e nasconde la ricerca, grid multi-colonna collassano a 1 colonna.
- **Stati**: badge colorati per Pagato/In attesa/Scaduto/Aperta/In lavorazione/Risolta/Vacante (vedi Design Tokens).

## State Management
- Vista attiva (stringa: dashboard/units/expenses/expenseDetail/expenseForm/reports/documents/settings/profile/notifications).
- Modale attiva (stringa o null) + stato dei campi di ciascuna maschera.
- Stato apertura sidebar mobile, dropdown notifiche, dropdown profilo (booleani, mutuamente esclusivi con le altre dropdown).
- Preferenza "metodo di ripartizione spese" impostata globalmente in Impostazioni, letta come default nel form Nuova spesa.
- Dati mock: unità, spese, segnalazioni, documenti, notifiche, utenti — in un'app reale provengono da API/DB.

## Design Tokens
- **Colore primario**: #2F3E8C (navy) — varianti soft/dark generate via color-mix per stati hover/attivo.
- **Testo**: ink #1c2230, secondario #5b6472.
- **Bordi**: #e2e5eb. **Sfondo pagina**: #f6f7f9. **Superficie card**: #ffffff.
- **Stati**: successo #1f8a5b (soft #e4f4ec), attenzione #b5790f (soft #fbeecd), errore #c23b3b (soft #f9e4e4), neutro #6b7280 (soft #eef0f3).
- **Font**: Source Sans 3 (400/500/600/700), fallback system-ui.
- **Radius**: 8px input/bottoni, 12-14px card, 999px badge/pill/avatar.
- **Ombre**: card modali 0 20px 60px rgba(20,25,40,0.2); dropdown 0 12px 32px rgba(20,25,40,0.12).

## Assets
Nessuna immagine: avatar a iniziali testuali, nessuna icona SVG (solo caratteri unicode per hamburger/campana/chiusura).

## Files
- `Residence Valentina - Gestione Condominiale.dc.html` — file di design principale (tutte le schermate e maschere).
- `screenshots/` — screenshot di riferimento per ciascuna schermata principale.
