"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Panel } from "@/components/ui/Panel";
import { Button, buttonClasses } from "@/components/ui/Button";
import { FieldGroup } from "@/components/ui/FieldGroup";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { FormError } from "@/components/ui/FormError";
import type { SplitMethod } from "@/lib/db-types";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import { createExpense } from "../actions";

const categories = EXPENSE_CATEGORIES;
const splitOptions: { value: SplitMethod; label: string }[] = [
  { value: "unita", label: "Per unità abitativa" },
  { value: "persone", label: "Per numero di persone" },
  { value: "millesimi", label: "Per millesimi" },
];

type NewExpenseFormProps = {
  defaultSplitMethod: SplitMethod;
};

export function NewExpenseForm({ defaultSplitMethod }: NewExpenseFormProps) {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [split, setSplit] = useState<SplitMethod>(defaultSplitMethod);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!description.trim() || !amount) {
      setError("Descrizione e importo sono obbligatori.");
      return;
    }
    setSaving(true);
    const result = await createExpense({
      description,
      category,
      amount: parseFloat(amount),
      expenseDate: date || new Date().toISOString().slice(0, 10),
      splitMethod: split,
      notes,
    });
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push("/expenses");
    router.refresh();
  }

  return (
    <div>
      <Link href="/expenses" className="mb-4 inline-block text-[13.5px] font-bold text-primary">
        &larr; Torna a spese &amp; pagamenti
      </Link>

      <Panel className="max-w-[640px] p-6 sm:p-7">
        <div className="text-[22px] font-bold text-ink">Nuova spesa</div>

        <form onSubmit={handleSubmit} className="mt-5 grid grid-cols-1 gap-x-5 lg:grid-cols-2">
          <FieldGroup>
            <Label htmlFor="expense-description">Descrizione</Label>
            <Input
              id="expense-description"
              placeholder="Es. Manutenzione ascensore"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="expense-category">Categoria</Label>
            <Select id="expense-category" value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="expense-amount">Importo (€)</Label>
            <Input
              id="expense-amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="expense-date">Data</Label>
            <Input id="expense-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </FieldGroup>
          <FieldGroup full>
            <Label htmlFor="expense-split">Ripartizione</Label>
            <Select id="expense-split" value={split} onChange={(e) => setSplit(e.target.value as SplitMethod)}>
              {splitOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </FieldGroup>
          <FieldGroup full>
            <Label htmlFor="expense-notes">Note</Label>
            <Textarea
              id="expense-notes"
              placeholder="Note aggiuntive (opzionale)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </FieldGroup>

          <div className="col-span-full">
            <FormError message={error} />
            <div className="flex gap-2.5">
              <Button type="submit" disabled={saving}>
                {saving ? "Salvataggio…" : "Salva spesa"}
              </Button>
              <Link href="/expenses" className={buttonClasses("secondary", "sm")}>
                Annulla
              </Link>
            </div>
          </div>
        </form>
      </Panel>
    </div>
  );
}
