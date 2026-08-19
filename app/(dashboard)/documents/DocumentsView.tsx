"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { Modal } from "@/components/ui/Modal";
import { FieldGroup } from "@/components/ui/FieldGroup";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { formatDate } from "@/lib/format";
import type { DocumentRow } from "@/lib/db-types";
import { createClient } from "@/lib/supabase/client";
import { createDocumentRecord } from "./actions";

const documentTypes = ["Verbale", "Regolamento", "Bilancio", "Preventivo", "Assicurazione", "Planimetria", "Altro"];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export type DocumentWithUrl = DocumentRow & { downloadUrl: string | null };

type DocumentsViewProps = {
  documents: DocumentWithUrl[];
};

export function DocumentsView({ documents }: DocumentsViewProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [docType, setDocType] = useState(documentTypes[0]);
  const [file, setFile] = useState<File | null>(null);

  function openModal() {
    setTitle("");
    setDocType(documentTypes[0]);
    setFile(null);
    setError("");
    setModalOpen(true);
  }

  async function handleSave() {
    if (!title.trim()) {
      setError("Il titolo è obbligatorio.");
      return;
    }
    if (!file) {
      setError("Seleziona un file da caricare.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("Il file supera i 20MB consentiti.");
      return;
    }

    setUploading(true);
    const supabase = createClient();
    const storagePath = `${crypto.randomUUID()}/${file.name}`;

    const { error: uploadError } = await supabase.storage.from("documents").upload(storagePath, file);
    if (uploadError) {
      setUploading(false);
      setError(`Caricamento file fallito: ${uploadError.message}`);
      return;
    }

    const result = await createDocumentRecord({ title, docType, storagePath });
    setUploading(false);
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
          <div className="text-[22px] font-bold text-ink">Documenti &amp; bacheca</div>
          <div className="mt-1 text-[13.5px] text-sub">Verbali, regolamenti, bilanci e avvisi</div>
        </div>
        <Button onClick={openModal}>+ Carica documento</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {documents.map((doc) => (
          <Panel key={doc.id} className="p-[18px] pb-4">
            <div className="mb-2.5 inline-block rounded-pill bg-primary-soft px-2.5 py-1 text-[11.5px] font-bold text-primary-dark">
              {doc.doc_type}
            </div>
            <div className="mb-1 text-[14.5px] font-bold leading-snug text-ink">{doc.title}</div>
            <div className="mb-3.5 text-[12.5px] text-sub">{formatDate(doc.doc_date)}</div>
            {doc.downloadUrl ? (
              <a href={doc.downloadUrl} download className={buttonClasses("secondary", "sm")}>
                Scarica
              </a>
            ) : (
              <Button variant="secondary" size="sm" disabled>
                Non disponibile
              </Button>
            )}
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
        saveLabel={uploading ? "Caricamento…" : "Salva"}
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
          <Select id="doc-type" value={docType} onChange={(e) => setDocType(e.target.value)}>
            {documentTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="doc-file">File</Label>
          <Input
            id="doc-file"
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </FieldGroup>
      </Modal>
    </div>
  );
}
