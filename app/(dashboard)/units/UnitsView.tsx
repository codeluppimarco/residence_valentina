"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { FieldGroup } from "@/components/ui/FieldGroup";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  TableCard,
  TableCell,
  TableCellStrong,
  TableHeaderRow,
  TableHeadCell,
  TableRow,
} from "@/components/ui/Table";
import { cn } from "@/lib/cn";
import type { UnitRow } from "@/lib/db-types";
import { createUnit, deleteUnit, updateUnit } from "./actions";

const GRID_COLS = "grid-cols-[1fr_1.6fr_1fr_1.4fr_1fr]";

type UnitsViewProps = {
  units: UnitRow[];
};

function OccupancyBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={cn(
        "inline-block rounded-pill px-2.5 py-1 text-[12.5px] font-semibold",
        isActive ? "bg-success-soft text-success" : "bg-neutral-soft text-neutral",
      )}
    >
      {isActive ? "Occupata" : "Vacante"}
    </span>
  );
}

export function UnitsView({ units }: UnitsViewProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<UnitRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [label, setLabel] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [floor, setFloor] = useState("");
  const [millesimi, setMillesimi] = useState("");
  const [residentCount, setResidentCount] = useState("");
  const [isActive, setIsActive] = useState("occupata");

  const vacant = units.filter((u) => !u.is_active).length;

  function openCreateModal() {
    setEditingUnit(null);
    setLabel("");
    setOwnerName("");
    setFloor("");
    setMillesimi("");
    setResidentCount("");
    setIsActive("occupata");
    setError("");
    setModalOpen(true);
  }

  function openEditModal(unit: UnitRow) {
    setEditingUnit(unit);
    setLabel(unit.label);
    setOwnerName(unit.owner_name);
    setFloor(unit.floor ?? "");
    setMillesimi(String(unit.millesimi));
    setResidentCount(String(unit.resident_count));
    setIsActive(unit.is_active ? "occupata" : "vacante");
    setError("");
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    const payload = {
      label,
      ownerName,
      floor,
      millesimi: parseFloat(millesimi) || 0,
      residentCount: parseInt(residentCount, 10) || 0,
      isActive: isActive === "occupata",
    };
    const result = editingUnit
      ? await updateUnit({ ...payload, id: editingUnit.id })
      : await createUnit(payload);
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setModalOpen(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!editingUnit) return;
    const confirmed = window.confirm(
      `Eliminare "${editingUnit.label}"? Verrà eliminato anche lo storico delle quote spesa già calcolate per questa unità. Non è reversibile.`,
    );
    if (!confirmed) return;
    setSaving(true);
    const result = await deleteUnit(editingUnit.id);
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setModalOpen(false);
    router.refresh();
  }

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="text-[22px] font-bold text-ink">Unità immobiliari</div>
          <div className="mt-1 text-[13.5px] text-sub">
            {units.length} unità totali · {units.length - vacant} occupate · {vacant} vacanti
          </div>
        </div>
        <Button onClick={openCreateModal}>+ Nuova unità</Button>
      </div>

      <TableCard>
        <TableHeaderRow className={GRID_COLS}>
          <TableHeadCell>Unità</TableHeadCell>
          <TableHeadCell>Proprietario</TableHeadCell>
          <TableHeadCell>Piano</TableHeadCell>
          <TableHeadCell>Quota millesimale</TableHeadCell>
          <TableHeadCell>Stato</TableHeadCell>
        </TableHeaderRow>
        {units.map((unit) => (
          <TableRow
            key={unit.id}
            className={cn(GRID_COLS, "cursor-pointer hover:bg-bg")}
            onClick={() => openEditModal(unit)}
          >
            <TableCellStrong>{unit.label}</TableCellStrong>
            <TableCell>{unit.owner_name}</TableCell>
            <TableCell>{unit.floor || "—"}</TableCell>
            <TableCell>{unit.millesimi.toLocaleString("it-IT", { maximumFractionDigits: 3 })}</TableCell>
            <TableCell>
              <OccupancyBadge isActive={unit.is_active} />
            </TableCell>
          </TableRow>
        ))}
        {units.length === 0 && <div className="px-4 py-8 text-center text-sm text-sub">Nessuna unità registrata.</div>}
      </TableCard>

      <Modal
        open={modalOpen}
        title={editingUnit ? "Modifica unità" : "Nuova unità"}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        error={error}
        saveLabel={saving ? "Salvataggio…" : "Salva"}
        onDelete={editingUnit ? handleDelete : undefined}
      >
        <FieldGroup>
          <Label htmlFor="unit-name">Unità</Label>
          <Input
            id="unit-name"
            placeholder="Es. Interno 11"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="unit-owner">Proprietario</Label>
          <Input
            id="unit-owner"
            placeholder="Nome e cognome"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
          />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="unit-floor">Piano</Label>
          <Input id="unit-floor" placeholder="Es. Piano 2" value={floor} onChange={(e) => setFloor(e.target.value)} />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="unit-millesimi">Millesimi</Label>
          <Input
            id="unit-millesimi"
            type="number"
            step="0.001"
            min="0"
            placeholder="Es. 42.500"
            value={millesimi}
            onChange={(e) => setMillesimi(e.target.value)}
          />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="unit-residents">Persone residenti</Label>
          <Input
            id="unit-residents"
            type="number"
            step="1"
            min="0"
            placeholder="Es. 2"
            value={residentCount}
            onChange={(e) => setResidentCount(e.target.value)}
          />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="unit-status">Stato</Label>
          <Select id="unit-status" value={isActive} onChange={(e) => setIsActive(e.target.value)}>
            <option value="occupata">Occupata</option>
            <option value="vacante">Vacante</option>
          </Select>
        </FieldGroup>
      </Modal>
    </div>
  );
}
