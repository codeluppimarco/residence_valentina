"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { FieldGroup } from "@/components/ui/FieldGroup";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import { deleteExpense, updateExpenseMeta } from "../actions";

type ExpenseActionsProps = {
  id: string;
  description: string;
  category: string;
  expenseDate: string;
  notes: string;
};

export function ExpenseActions({ id, description, category, expenseDate, notes }: ExpenseActionsProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formDescription, setFormDescription] = useState(description);
  const [formCategory, setFormCategory] = useState(category);
  const [formDate, setFormDate] = useState(expenseDate);
  const [formNotes, setFormNotes] = useState(notes);

  function openModal() {
    setFormDescription(description);
    setFormCategory(category);
    setFormDate(expenseDate);
    setFormNotes(notes);
    setError("");
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    const result = await updateExpenseMeta({
      id,
      description: formDescription,
      category: formCategory,
      expenseDate: formDate,
      notes: formNotes,
    });
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setModalOpen(false);
    router.refresh();
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Eliminare questa spesa? Verranno eliminate anche tutte le quote e i pagamenti collegati. Non è reversibile.",
    );
    if (!confirmed) return;
    setSaving(true);
    const result = await deleteExpense(id);
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push("/expenses");
    router.refresh();
  }

  return (
    <>
      <div className="mt-5 flex gap-2.5">
        <Button variant="secondary" onClick={openModal}>
          Modifica
        </Button>
        <Button variant="danger" onClick={handleDelete}>
          Elimina
        </Button>
      </div>

      <Modal
        open={modalOpen}
        title="Modifica spesa"
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        error={error}
        saveLabel={saving ? "Salvataggio…" : "Salva"}
      >
        <p className="mb-3 text-xs text-sub">
          Importo e ripartizione non sono modificabili qui: cambiarli invaliderebbe le quote già calcolate. Per
          correggerli, elimina la spesa e registrala di nuovo.
        </p>
        <FieldGroup>
          <Label htmlFor="edit-expense-description">Descrizione</Label>
          <Input
            id="edit-expense-description"
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
          />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="edit-expense-category">Categoria</Label>
          <Select id="edit-expense-category" value={formCategory} onChange={(e) => setFormCategory(e.target.value)}>
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="edit-expense-date">Data</Label>
          <Input id="edit-expense-date" type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="edit-expense-notes">Note</Label>
          <Textarea id="edit-expense-notes" value={formNotes} onChange={(e) => setFormNotes(e.target.value)} />
        </FieldGroup>
      </Modal>
    </>
  );
}
