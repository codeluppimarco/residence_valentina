"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
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
import { units as initialUnits } from "@/lib/mock-data";
import type { StatusLabel, Unit } from "@/lib/types";

const GRID_COLS = "grid-cols-[1fr_1.6fr_1fr_1.4fr_1fr]";
const unitStatuses: StatusLabel[] = ["Pagato", "In attesa", "Scaduto", "Vacante"];

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>(initialUnits);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [owner, setOwner] = useState("");
  const [floor, setFloor] = useState("");
  const [quota, setQuota] = useState("");
  const [status, setStatus] = useState<StatusLabel>("Pagato");

  const vacant = units.filter((u) => u.status === "Vacante").length;

  function openModal() {
    setName("");
    setOwner("");
    setFloor("");
    setQuota("");
    setStatus("Pagato");
    setError("");
    setModalOpen(true);
  }

  function handleSave() {
    if (!name.trim() || !owner.trim()) {
      setError("Unità e proprietario sono obbligatori.");
      return;
    }
    setUnits((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        unit: name,
        owner,
        floor: floor || "—",
        quota: quota || "—",
        status,
      },
    ]);
    setModalOpen(false);
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
        <Button onClick={openModal}>+ Nuova unità</Button>
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
          <TableRow key={unit.id} className={GRID_COLS}>
            <TableCellStrong>{unit.unit}</TableCellStrong>
            <TableCell>{unit.owner}</TableCell>
            <TableCell>{unit.floor}</TableCell>
            <TableCell>{unit.quota}</TableCell>
            <TableCell>
              <Badge status={unit.status} />
            </TableCell>
          </TableRow>
        ))}
      </TableCard>

      <Modal open={modalOpen} title="Nuova unità" onClose={() => setModalOpen(false)} onSave={handleSave} error={error}>
        <FieldGroup>
          <Label htmlFor="unit-name">Unità</Label>
          <Input id="unit-name" placeholder="Es. Interno 11" value={name} onChange={(e) => setName(e.target.value)} />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="unit-owner">Proprietario</Label>
          <Input id="unit-owner" placeholder="Nome e cognome" value={owner} onChange={(e) => setOwner(e.target.value)} />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="unit-floor">Piano</Label>
          <Input id="unit-floor" placeholder="Es. Piano 2" value={floor} onChange={(e) => setFloor(e.target.value)} />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="unit-quota">Quota millesimale</Label>
          <Input id="unit-quota" placeholder="Es. 4,5%" value={quota} onChange={(e) => setQuota(e.target.value)} />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="unit-status">Stato</Label>
          <Select id="unit-status" value={status} onChange={(e) => setStatus(e.target.value as StatusLabel)}>
            {unitStatuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </FieldGroup>
      </Modal>
    </div>
  );
}
