"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Panel } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { FieldGroup } from "@/components/ui/FieldGroup";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { formatCurrency, formatDate } from "@/lib/format";
import { paymentStatusLabel } from "@/lib/status";
import type { PaymentStatus } from "@/lib/db-types";
import { setPaymentPaidDate, updatePaymentStatus } from "../actions";

export type ShareRow = {
  paymentId: string;
  unitLabel: string;
  amount: number;
  status: PaymentStatus;
  paidAt: string | null;
};

type PaymentsPanelProps = {
  expenseId: string;
  shares: ShareRow[];
};

export function PaymentsPanel({ expenseId, shares }: PaymentsPanelProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const [dateModalShare, setDateModalShare] = useState<ShareRow | null>(null);
  const [dateValue, setDateValue] = useState("");
  const [dateError, setDateError] = useState("");
  const [savingDate, setSavingDate] = useState(false);

  function toggle(paymentId: string, current: PaymentStatus) {
    const next: PaymentStatus = current === "pagato" ? "in_attesa" : "pagato";
    setPendingId(paymentId);
    startTransition(async () => {
      await updatePaymentStatus(paymentId, next, expenseId);
      router.refresh();
      setPendingId(null);
    });
  }

  function openDateModal(share: ShareRow) {
    setDateModalShare(share);
    setDateValue(share.paidAt ?? new Date().toISOString().slice(0, 10));
    setDateError("");
  }

  async function handleSaveDate() {
    if (!dateModalShare) return;
    setSavingDate(true);
    const result = await setPaymentPaidDate(dateModalShare.paymentId, dateValue, expenseId);
    setSavingDate(false);
    if (result.error) {
      setDateError(result.error);
      return;
    }
    setDateModalShare(null);
    router.refresh();
  }

  return (
    <Panel>
      <div className="mb-3 text-[15.5px] font-bold text-ink">Quote per unità</div>
      {shares.map((share) => (
        <div
          key={share.paymentId}
          className="flex items-center justify-between gap-3 border-t border-border py-2.5 first:border-t-0"
        >
          <div>
            <div className="text-sm font-semibold text-ink">{share.unitLabel}</div>
            <div className="text-[12.5px] text-sub">{formatCurrency(share.amount)}</div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <button
              type="button"
              onClick={() => toggle(share.paymentId, share.status)}
              disabled={pending && pendingId === share.paymentId}
              className="disabled:opacity-60"
              title="Segna pagato/in attesa (oggi)"
            >
              <Badge status={paymentStatusLabel(share.status)} />
            </button>
            <button
              type="button"
              onClick={() => openDateModal(share)}
              className="text-[11.5px] font-semibold text-primary"
            >
              {share.paidAt ? formatDate(share.paidAt) : "Imposta data"}
            </button>
          </div>
        </div>
      ))}
      {shares.length === 0 && <p className="py-4 text-center text-sm text-sub">Nessuna quota calcolata.</p>}

      <Modal
        open={dateModalShare !== null}
        title={`Data pagamento — ${dateModalShare?.unitLabel ?? ""}`}
        onClose={() => setDateModalShare(null)}
        onSave={handleSaveDate}
        error={dateError}
        saveLabel={savingDate ? "Salvataggio…" : "Salva"}
      >
        <FieldGroup>
          <Label htmlFor="payment-date">Data pagamento</Label>
          <Input id="payment-date" type="date" value={dateValue} onChange={(e) => setDateValue(e.target.value)} />
        </FieldGroup>
      </Modal>
    </Panel>
  );
}
