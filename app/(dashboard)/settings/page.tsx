"use client";

import { useState } from "react";
import { Panel } from "@/components/ui/Panel";
import { Toggle } from "@/components/ui/Toggle";
import { Avatar } from "@/components/ui/Avatar";
import { Modal } from "@/components/ui/Modal";
import { FieldGroup } from "@/components/ui/FieldGroup";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/cn";
import { appUsers as initialUsers } from "@/lib/mock-data";
import type { AppUser, SplitMethod } from "@/lib/types";

const splitOptions: { key: SplitMethod; label: string }[] = [
  { key: "Unita", label: "Per unità abitativa" },
  { key: "Persone", label: "Per numero di persone" },
  { key: "Millesimi", label: "Per millesimi" },
];

const userRoles = ["Amministratore", "Residente"];

export default function SettingsPage() {
  const [unitCount, setUnitCount] = useState("24");
  const [splitMethod, setSplitMethod] = useState<SplitMethod>("Millesimi");
  const [notifyReports, setNotifyReports] = useState(true);
  const [notifyDueDates, setNotifyDueDates] = useState(true);
  const [notifyDocuments, setNotifyDocuments] = useState(false);

  const [users, setUsers] = useState<AppUser[]>(initialUsers);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState(userRoles[1]);
  const [userUnit, setUserUnit] = useState("");

  function openModal() {
    setUserName("");
    setUserRole(userRoles[1]);
    setUserUnit("");
    setError("");
    setModalOpen(true);
  }

  function handleSaveUser() {
    if (!userName.trim()) {
      setError("Il nome è obbligatorio.");
      return;
    }
    setUsers((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        name: userName,
        roleLabel:
          userRole === "Amministratore" ? "Amministratore" : `Residente${userUnit ? " · " + userUnit : ""}`,
      },
    ]);
    setModalOpen(false);
  }

  return (
    <div>
      <div className="mb-5 text-[22px] font-bold text-ink">Impostazioni</div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Panel>
          <div className="mb-3 text-[15.5px] font-bold text-ink">Dati condominio</div>
          <FieldGroup>
            <Label htmlFor="settings-name">Nome</Label>
            <Input id="settings-name" defaultValue="Residence Valentina" readOnly />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="settings-address">Indirizzo</Label>
            <Input id="settings-address" defaultValue="Via dei Tigli 14, Modena" readOnly />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="settings-vat">Codice fiscale</Label>
            <Input id="settings-vat" defaultValue="94032100365" readOnly />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="settings-unit-count">Numero di unità abitative</Label>
            <Input
              id="settings-unit-count"
              type="number"
              min={1}
              value={unitCount}
              onChange={(e) => setUnitCount(e.target.value)}
            />
          </FieldGroup>
        </Panel>

        <Panel>
          <div className="mb-1 text-[15.5px] font-bold text-ink">Ripartizione spese condominiali</div>
          <div role="radiogroup" aria-label="Ripartizione spese condominiali">
            {splitOptions.map((option) => {
              const selected = splitMethod === option.key;
              return (
                <button
                  key={option.key}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setSplitMethod(option.key)}
                  className="flex min-h-11 w-full items-center gap-2.5 border-t border-border py-2.5 text-left"
                >
                  <span
                    className={cn(
                      "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-pill border-2",
                      selected ? "border-primary" : "border-border",
                    )}
                  >
                    <span
                      className={cn("h-[9px] w-[9px] rounded-pill", selected ? "bg-primary" : "bg-transparent")}
                    />
                  </span>
                  <span className={cn("text-sm text-ink", selected ? "font-bold" : "font-medium")}>
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        </Panel>

        <Panel>
          <div className="mb-1 text-[15.5px] font-bold text-ink">Preferenze notifiche</div>
          <label
            htmlFor="notify-reports"
            className="flex min-h-11 cursor-pointer items-center justify-between border-t border-border py-2.5 text-sm text-ink"
          >
            <span>Nuove segnalazioni</span>
            <Toggle
              id="notify-reports"
              checked={notifyReports}
              onChange={() => setNotifyReports((v) => !v)}
              label="Nuove segnalazioni"
            />
          </label>
          <label
            htmlFor="notify-due-dates"
            className="flex min-h-11 cursor-pointer items-center justify-between border-t border-border py-2.5 text-sm text-ink"
          >
            <span>Pagamenti in scadenza</span>
            <Toggle
              id="notify-due-dates"
              checked={notifyDueDates}
              onChange={() => setNotifyDueDates((v) => !v)}
              label="Pagamenti in scadenza"
            />
          </label>
          <label
            htmlFor="notify-documents"
            className="flex min-h-11 cursor-pointer items-center justify-between border-t border-border py-2.5 text-sm text-ink"
          >
            <span>Documenti caricati</span>
            <Toggle
              id="notify-documents"
              checked={notifyDocuments}
              onChange={() => setNotifyDocuments((v) => !v)}
              label="Documenti caricati"
            />
          </label>
        </Panel>

        <Panel>
          <div className="mb-2 flex items-center justify-between">
            <div className="text-[15.5px] font-bold text-ink">Utenti e ruoli</div>
            <button type="button" onClick={openModal} className="text-[13px] font-bold text-primary">
              + Nuovo utente
            </button>
          </div>
          {users.map((user) => (
            <div key={user.id} className="flex items-center gap-2.5 border-t border-border py-2.5">
              <Avatar name={user.name} size="sm" />
              <div>
                <div className="text-[13.5px] font-semibold text-ink">{user.name}</div>
                <div className="text-xs text-sub">{user.roleLabel}</div>
              </div>
            </div>
          ))}
        </Panel>
      </div>

      <Modal
        open={modalOpen}
        title="Nuovo utente"
        onClose={() => setModalOpen(false)}
        onSave={handleSaveUser}
        error={error}
      >
        <FieldGroup>
          <Label htmlFor="new-user-name">Nome completo</Label>
          <Input
            id="new-user-name"
            placeholder="Nome e cognome"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="new-user-role">Ruolo</Label>
          <Select id="new-user-role" value={userRole} onChange={(e) => setUserRole(e.target.value)}>
            {userRoles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="new-user-unit">Unità collegata</Label>
          <Input
            id="new-user-unit"
            placeholder="Es. Interno 3 (opzionale)"
            value={userUnit}
            onChange={(e) => setUserUnit(e.target.value)}
          />
        </FieldGroup>
      </Modal>
    </div>
  );
}
