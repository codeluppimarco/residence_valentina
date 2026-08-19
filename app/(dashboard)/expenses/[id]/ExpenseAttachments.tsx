"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Panel } from "@/components/ui/Panel";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { FieldGroup } from "@/components/ui/FieldGroup";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { formatCurrency, formatDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import { markExpenseSettled, saveExpenseAttachment, unmarkExpenseSettled } from "../actions";

type AttachmentField = "quote_path" | "invoice_path";

type ExpenseAttachmentsProps = {
  expenseId: string;
  amount: number;
  quotePath: string | null;
  quoteUrl: string | null;
  invoicePath: string | null;
  invoiceUrl: string | null;
  settledAt: string | null;
};

function AttachmentRow({
  label,
  path,
  url,
  onUpload,
  uploading,
}: {
  label: string;
  path: string | null;
  url: string | null;
  onUpload: (file: File) => void;
  uploading: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-border py-2.5 first:border-t-0">
      <div className="text-sm font-semibold text-ink">{label}</div>
      <div className="flex items-center gap-2">
        {path && url && (
          <a href={url} download className={buttonClasses("secondary", "sm")}>
            Scarica
          </a>
        )}
        <label className={buttonClasses("secondary", "sm", false, "cursor-pointer")}>
          {uploading ? "Caricamento…" : path ? "Sostituisci" : "Carica"}
          <input
            type="file"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(file);
              e.target.value = "";
            }}
          />
        </label>
      </div>
    </div>
  );
}

export function ExpenseAttachments({
  expenseId,
  amount,
  quotePath,
  quoteUrl,
  invoicePath,
  invoiceUrl,
  settledAt,
}: ExpenseAttachmentsProps) {
  const router = useRouter();
  const [uploadingField, setUploadingField] = useState<AttachmentField | null>(null);
  const [uploadError, setUploadError] = useState("");

  const [settleModalOpen, setSettleModalOpen] = useState(false);
  const [settleDate, setSettleDate] = useState("");
  const [settleSaving, setSettleSaving] = useState(false);
  const [settleError, setSettleError] = useState("");

  async function handleUpload(field: AttachmentField, file: File) {
    setUploadingField(field);
    setUploadError("");
    const supabase = createClient();
    const storagePath = `${expenseId}/${field}-${crypto.randomUUID()}-${file.name}`;

    const { error: uploadErr } = await supabase.storage.from("expense-attachments").upload(storagePath, file);
    if (uploadErr) {
      setUploadingField(null);
      setUploadError(`Caricamento fallito: ${uploadErr.message}`);
      return;
    }

    const result = await saveExpenseAttachment(expenseId, field, storagePath);
    setUploadingField(null);
    if (result.error) {
      setUploadError(result.error);
      return;
    }
    router.refresh();
  }

  function openSettleModal() {
    setSettleDate(new Date().toISOString().slice(0, 10));
    setSettleError("");
    setSettleModalOpen(true);
  }

  async function handleSaveSettle() {
    setSettleSaving(true);
    const result = await markExpenseSettled(expenseId, settleDate);
    setSettleSaving(false);
    if (result.error) {
      setSettleError(result.error);
      return;
    }
    setSettleModalOpen(false);
    router.refresh();
  }

  async function handleUnsettle() {
    const confirmed = window.confirm("Annullare il pagamento al fornitore? Verrà rimossa anche l'uscita di cassa collegata.");
    if (!confirmed) return;
    await unmarkExpenseSettled(expenseId);
    router.refresh();
  }

  return (
    <Panel>
      <div className="mb-1 text-[15.5px] font-bold text-ink">Allegati e fornitore</div>
      <AttachmentRow
        label="Preventivo"
        path={quotePath}
        url={quoteUrl}
        uploading={uploadingField === "quote_path"}
        onUpload={(file) => handleUpload("quote_path", file)}
      />
      <AttachmentRow
        label="Fattura"
        path={invoicePath}
        url={invoiceUrl}
        uploading={uploadingField === "invoice_path"}
        onUpload={(file) => handleUpload("invoice_path", file)}
      />
      {uploadError && <p className="mt-2 text-[13px] font-semibold text-danger">{uploadError}</p>}

      <div className="flex items-center justify-between gap-3 border-t border-border py-2.5">
        <div>
          <div className="text-sm font-semibold text-ink">Pagamento fornitore</div>
          {settledAt && (
            <div className="text-[12.5px] text-sub">
              Saldata il {formatDate(settledAt)} · {formatCurrency(amount)}
            </div>
          )}
        </div>
        {settledAt ? (
          <Button variant="secondary" size="sm" onClick={handleUnsettle}>
            Annulla
          </Button>
        ) : (
          <Button variant="secondary" size="sm" onClick={openSettleModal}>
            Segna come saldata
          </Button>
        )}
      </div>

      <Modal
        open={settleModalOpen}
        title="Segna spesa come saldata"
        onClose={() => setSettleModalOpen(false)}
        onSave={handleSaveSettle}
        error={settleError}
        saveLabel={settleSaving ? "Salvataggio…" : "Salva"}
      >
        <p className="mb-3 text-xs text-sub">
          Registra che l&apos;amministratore ha pagato il fornitore per l&apos;intera spesa ({formatCurrency(amount)}).
          Genera una uscita nel registro di cassa, distinta dai pagamenti delle singole quote.
        </p>
        <FieldGroup>
          <Label htmlFor="settle-date">Data pagamento</Label>
          <Input id="settle-date" type="date" value={settleDate} onChange={(e) => setSettleDate(e.target.value)} />
        </FieldGroup>
      </Modal>
    </Panel>
  );
}
