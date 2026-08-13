"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Panel } from "@/components/ui/Panel";
import { Modal } from "@/components/ui/Modal";
import { FieldGroup } from "@/components/ui/FieldGroup";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { reports as initialReports } from "@/lib/mock-data";
import type { Report } from "@/lib/types";

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [unitLabel, setUnitLabel] = useState("");
  const [description, setDescription] = useState("");

  function openModal() {
    setTitle("");
    setUnitLabel("");
    setDescription("");
    setError("");
    setModalOpen(true);
  }

  function handleSave() {
    if (!title.trim()) {
      setError("Il titolo è obbligatorio.");
      return;
    }
    setReports((prev) => [
      {
        id: prev.length + 1,
        title,
        unitLabel: unitLabel || "Parti comuni",
        dateLabel: "oggi",
        status: "Aperta",
        assignee: "non assegnato",
      },
      ...prev,
    ]);
    setModalOpen(false);
  }

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="text-[22px] font-bold text-ink">Segnalazioni</div>
          <div className="mt-1 text-[13.5px] text-sub">
            Manutenzione e problemi segnalati dai residenti
          </div>
        </div>
        <Button onClick={openModal}>+ Nuova segnalazione</Button>
      </div>

      <div className="flex flex-col gap-3">
        {reports.map((report) => (
          <Panel key={report.id} className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="text-[15px] font-bold text-ink">{report.title}</div>
              <Badge status={report.status} />
            </div>
            <div className="mt-2 text-[13px] text-sub">
              {report.unitLabel} · {report.dateLabel} · Assegnato a {report.assignee}
            </div>
          </Panel>
        ))}
        {reports.length === 0 && (
          <p className="py-6 text-center text-sm text-sub">Nessuna segnalazione registrata.</p>
        )}
      </div>

      <Modal
        open={modalOpen}
        title="Nuova segnalazione"
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        error={error}
      >
        <FieldGroup>
          <Label htmlFor="report-title">Titolo segnalazione</Label>
          <Input
            id="report-title"
            placeholder="Es. Perdita acqua garage"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="report-unit">Unità / parti comuni</Label>
          <Input
            id="report-unit"
            placeholder="Es. Interno 5 o Parti comuni"
            value={unitLabel}
            onChange={(e) => setUnitLabel(e.target.value)}
          />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="report-description">Descrizione</Label>
          <Textarea
            id="report-description"
            placeholder="Descrivi il problema"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </FieldGroup>
      </Modal>
    </div>
  );
}
