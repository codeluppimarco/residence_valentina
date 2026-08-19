"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Panel } from "@/components/ui/Panel";
import { Modal } from "@/components/ui/Modal";
import { FieldGroup } from "@/components/ui/FieldGroup";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { formatDate } from "@/lib/format";
import type { StatusLabel } from "@/lib/types";
import type { ReportRow } from "@/lib/db-types";
import { createReport, deleteReport, updateReport } from "./actions";

const statusOptions: StatusLabel[] = ["Aperta", "In lavorazione", "Risolta"];

type ReportsViewProps = {
  reports: ReportRow[];
};

export function ReportsView({ reports }: ReportsViewProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<ReportRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [unitLabel, setUnitLabel] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<StatusLabel>("Aperta");
  const [assignee, setAssignee] = useState("");

  function openCreateModal() {
    setEditingReport(null);
    setTitle("");
    setUnitLabel("");
    setDescription("");
    setStatus("Aperta");
    setAssignee("");
    setError("");
    setModalOpen(true);
  }

  function openEditModal(report: ReportRow) {
    setEditingReport(report);
    setTitle(report.title);
    setUnitLabel(report.unit_label);
    setDescription(report.description ?? "");
    setStatus(report.status as StatusLabel);
    setAssignee(report.assignee ?? "");
    setError("");
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    const result = editingReport
      ? await updateReport({ id: editingReport.id, title, unitLabel, description, status, assignee })
      : await createReport({ title, unitLabel, description });
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setModalOpen(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!editingReport) return;
    const confirmed = window.confirm(`Eliminare la segnalazione "${editingReport.title}"? Non è reversibile.`);
    if (!confirmed) return;
    setSaving(true);
    const result = await deleteReport(editingReport.id);
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
          <div className="text-[22px] font-bold text-ink">Segnalazioni</div>
          <div className="mt-1 text-[13.5px] text-sub">Manutenzione e problemi segnalati dai residenti</div>
        </div>
        <Button onClick={openCreateModal}>+ Nuova segnalazione</Button>
      </div>

      <div className="flex flex-col gap-3">
        {reports.map((report) => (
          <Panel
            key={report.id}
            className="cursor-pointer p-4 hover:bg-bg sm:p-5"
            onClick={() => openEditModal(report)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="text-[15px] font-bold text-ink">{report.title}</div>
              <Badge status={report.status as StatusLabel} />
            </div>
            <div className="mt-2 text-[13px] text-sub">
              {report.unit_label} · {formatDate(report.created_at)} · Assegnato a {report.assignee || "non assegnato"}
            </div>
          </Panel>
        ))}
        {reports.length === 0 && (
          <p className="py-6 text-center text-sm text-sub">Nessuna segnalazione registrata.</p>
        )}
      </div>

      <Modal
        open={modalOpen}
        title={editingReport ? "Modifica segnalazione" : "Nuova segnalazione"}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        error={error}
        saveLabel={saving ? "Salvataggio…" : "Salva"}
        onDelete={editingReport ? handleDelete : undefined}
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
        {editingReport && (
          <>
            <FieldGroup>
              <Label htmlFor="report-status">Stato</Label>
              <Select id="report-status" value={status} onChange={(e) => setStatus(e.target.value as StatusLabel)}>
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="report-assignee">Assegnato a</Label>
              <Input
                id="report-assignee"
                placeholder="Es. Idraulica Rossi"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
              />
            </FieldGroup>
          </>
        )}
      </Modal>
    </div>
  );
}
