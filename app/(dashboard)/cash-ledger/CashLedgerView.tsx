"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { Modal } from "@/components/ui/Modal";
import { FieldGroup } from "@/components/ui/FieldGroup";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { TableCard, TableCell, TableCellStrong, TableHeaderRow, TableHeadCell, TableRow } from "@/components/ui/Table";
import { cn } from "@/lib/cn";
import { formatCurrency, formatDate } from "@/lib/format";
import type { CashLedgerRow } from "@/lib/db-types";
import { createLedgerEntry, deleteLedgerEntry } from "./actions";

const GRID_COLS = "grid-cols-[110px_1fr_130px_90px]";

type CashLedgerViewProps = {
  entries: CashLedgerRow[];
  balance: number;
};

export function CashLedgerView({ entries, balance }: CashLedgerViewProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [entryDate, setEntryDate] = useState("");
  const [description, setDescription] = useState("");
  const [direction, setDirection] = useState<"entrata" | "uscita">("entrata");
  const [amount, setAmount] = useState("");
  const [rowError, setRowError] = useState<{ id: string; message: string } | null>(null);

  function openModal() {
    setEntryDate(new Date().toISOString().slice(0, 10));
    setDescription("");
    setDirection("entrata");
    setAmount("");
    setError("");
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    const result = await createLedgerEntry({
      entryDate,
      description,
      amount: parseFloat(amount) || 0,
      direction,
    });
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setModalOpen(false);
    router.refresh();
  }

  async function handleDelete(entry: CashLedgerRow) {
    const confirmed = window.confirm(`Eliminare la voce "${entry.description}"? Non è reversibile.`);
    if (!confirmed) return;
    setRowError(null);
    const result = await deleteLedgerEntry(entry.id);
    if (result.error) {
      setRowError({ id: entry.id, message: result.error });
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="text-[22px] font-bold text-ink">Registro di cassa</div>
          <div className="mt-1 text-[13.5px] text-sub">Entrate e uscite del condominio</div>
        </div>
        <Button onClick={openModal}>+ Nuova voce</Button>
      </div>

      <Panel className="mb-5 max-w-xs">
        <div className="text-[13px] font-semibold text-sub">Saldo attuale</div>
        <div className={cn("mt-2 text-2xl font-bold", balance >= 0 ? "text-ink" : "text-danger")}>
          {formatCurrency(balance)}
        </div>
      </Panel>

      <TableCard>
        <TableHeaderRow className={GRID_COLS}>
          <TableHeadCell>Data</TableHeadCell>
          <TableHeadCell>Descrizione</TableHeadCell>
          <TableHeadCell>Importo</TableHeadCell>
          <TableHeadCell></TableHeadCell>
        </TableHeaderRow>
        {entries.map((entry) => {
          const isManual = !entry.expense_id && !entry.payment_id;
          return (
            <TableRow key={entry.id} className={GRID_COLS}>
              <TableCell>{formatDate(entry.entry_date)}</TableCell>
              <TableCellStrong>{entry.description}</TableCellStrong>
              <TableCell className={cn("font-semibold", entry.amount >= 0 ? "text-success" : "text-danger")}>
                {entry.amount >= 0 ? "+" : ""}
                {formatCurrency(entry.amount)}
              </TableCell>
              <TableCell>
                {isManual && (
                  <button
                    type="button"
                    onClick={() => handleDelete(entry)}
                    className="text-[12.5px] font-semibold text-danger"
                  >
                    Elimina
                  </button>
                )}
              </TableCell>
            </TableRow>
          );
        })}
        {entries.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-sub">Nessuna voce registrata.</div>
        )}
      </TableCard>
      {rowError && <p className="mt-2 text-[13px] font-semibold text-danger">{rowError.message}</p>}

      <Modal
        open={modalOpen}
        title="Nuova voce di cassa"
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        error={error}
        saveLabel={saving ? "Salvataggio…" : "Salva"}
      >
        <FieldGroup>
          <Label htmlFor="ledger-date">Data</Label>
          <Input id="ledger-date" type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="ledger-description">Descrizione</Label>
          <Input
            id="ledger-description"
            placeholder="Es. Interessi bancari"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="ledger-direction">Tipo</Label>
          <Select
            id="ledger-direction"
            value={direction}
            onChange={(e) => setDirection(e.target.value as "entrata" | "uscita")}
          >
            <option value="entrata">Entrata</option>
            <option value="uscita">Uscita</option>
          </Select>
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="ledger-amount">Importo (€)</Label>
          <Input
            id="ledger-amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0,00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </FieldGroup>
      </Modal>
    </div>
  );
}
