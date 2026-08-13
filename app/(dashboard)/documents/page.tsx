"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { Modal } from "@/components/ui/Modal";
import { FieldGroup } from "@/components/ui/FieldGroup";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { documents as initialDocuments } from "@/lib/mock-data";
import type { DocumentItem } from "@/lib/types";

const documentTypes = ["Verbale", "Regolamento", "Bilancio", "Preventivo", "Assicurazione", "Planimetria", "Altro"];

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>(initialDocuments);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState(documentTypes[0]);

  function openModal() {
    setTitle("");
    setType(documentTypes[0]);
    setError("");
    setModalOpen(true);
  }

  function handleSave() {
    if (!title.trim()) {
      setError("Il titolo è obbligatorio.");
      return;
    }
    setDocuments((prev) => [
      { id: prev.length + 1, title, typeLabel: type, dateLabel: "oggi" },
      ...prev,
    ]);
    setModalOpen(false);
  }

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="text-[22px] font-bold text-ink">Documenti &amp; bacheca</div>
          <div className="mt-1 text-[13.5px] text-sub">Verbali, regolamenti, bilanci e avvisi</div>
        </div>
        <Button onClick={openModal}>+ Carica documento</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {documents.map((doc) => (
          <Panel key={doc.id} className="p-[18px] pb-4">
            <div className="mb-2.5 inline-block rounded-pill bg-primary-soft px-2.5 py-1 text-[11.5px] font-bold text-primary-dark">
              {doc.typeLabel}
            </div>
            <div className="mb-1 text-[14.5px] font-bold leading-snug text-ink">{doc.title}</div>
            <div className="mb-3.5 text-[12.5px] text-sub">{doc.dateLabel}</div>
            <Button variant="secondary" size="sm">
              Scarica
            </Button>
          </Panel>
        ))}
        {documents.length === 0 && (
          <p className="col-span-full py-6 text-center text-sm text-sub">Nessun documento caricato.</p>
        )}
      </div>

      <Modal
        open={modalOpen}
        title="Carica documento"
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        error={error}
      >
        <FieldGroup>
          <Label htmlFor="doc-title">Titolo documento</Label>
          <Input
            id="doc-title"
            placeholder="Es. Verbale assemblea"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="doc-type">Tipo</Label>
          <Select id="doc-type" value={type} onChange={(e) => setType(e.target.value)}>
            {documentTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="doc-file">File</Label>
          <Input id="doc-file" type="file" />
        </FieldGroup>
      </Modal>
    </div>
  );
}
