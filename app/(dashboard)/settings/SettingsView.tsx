"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Panel } from "@/components/ui/Panel";
import { Toggle } from "@/components/ui/Toggle";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { FieldGroup } from "@/components/ui/FieldGroup";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { FormError } from "@/components/ui/FormError";
import { cn } from "@/lib/cn";
import { roleLabel } from "@/lib/format";
import type { ConfigRow, Role, SplitMethod } from "@/lib/db-types";
import { inviteUser, updateConfig, updateSplitMethod } from "./actions";

const splitOptions: { key: SplitMethod; label: string }[] = [
  { key: "unita", label: "Per unità abitativa" },
  { key: "persone", label: "Per numero di persone" },
  { key: "millesimi", label: "Per millesimi" },
];

const roleOptions: { value: Role; label: string }[] = [
  { value: "admin", label: "Amministratore" },
  { value: "revisore", label: "Revisore" },
  { value: "condomino", label: "Residente" },
];

type ProfileWithUnit = {
  id: string;
  full_name: string;
  role: Role;
  unit_id: string | null;
  units: { label: string } | { label: string }[] | null;
};

type SettingsViewProps = {
  config: ConfigRow | null;
  profiles: ProfileWithUnit[];
  units: { id: string; label: string }[];
};

function unitLabelOf(profile: ProfileWithUnit): string | null {
  const u = profile.units;
  if (!u) return null;
  return Array.isArray(u) ? (u[0]?.label ?? null) : u.label;
}

export function SettingsView({ config, profiles, units }: SettingsViewProps) {
  const router = useRouter();

  // --- Dati condominio ---
  const [condoName, setCondoName] = useState(config?.condo_name ?? "");
  const [address, setAddress] = useState(config?.address ?? "");
  const [taxCode, setTaxCode] = useState(config?.tax_code ?? "");
  const [iban, setIban] = useState(config?.iban ?? "");
  const [configSaving, setConfigSaving] = useState(false);
  const [configError, setConfigError] = useState("");
  const [configSaved, setConfigSaved] = useState(false);

  async function handleSaveConfig() {
    setConfigSaving(true);
    setConfigSaved(false);
    const result = await updateConfig({ condoName, address, taxCode, iban });
    setConfigSaving(false);
    if (result.error) {
      setConfigError(result.error);
      return;
    }
    setConfigError("");
    setConfigSaved(true);
    router.refresh();
  }

  // --- Ripartizione ---
  const [splitMethod, setSplitMethod] = useState<SplitMethod>(config?.default_split_method ?? "millesimi");
  const [splitSaving, setSplitSaving] = useState(false);

  async function handleSelectSplit(method: SplitMethod) {
    setSplitMethod(method);
    setSplitSaving(true);
    await updateSplitMethod(method);
    setSplitSaving(false);
    router.refresh();
  }

  // --- Preferenze notifiche (solo UI locale: nessuna tabella dedicata ancora) ---
  const [notifyReports, setNotifyReports] = useState(true);
  const [notifyDueDates, setNotifyDueDates] = useState(true);
  const [notifyDocuments, setNotifyDocuments] = useState(false);

  // --- Utenti e ruoli ---
  const [modalOpen, setModalOpen] = useState(false);
  const [inviteSaving, setInviteSaving] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState<Role>("condomino");
  const [userUnitId, setUserUnitId] = useState("");

  function openModal() {
    setUserName("");
    setUserEmail("");
    setUserRole("condomino");
    setUserUnitId("");
    setInviteError("");
    setModalOpen(true);
  }

  async function handleInvite() {
    setInviteSaving(true);
    const result = await inviteUser({
      fullName: userName,
      email: userEmail,
      role: userRole,
      unitId: userRole === "condomino" ? userUnitId || null : null,
    });
    setInviteSaving(false);
    if (result.error) {
      setInviteError(result.error);
      return;
    }
    setModalOpen(false);
    router.refresh();
  }

  return (
    <div>
      <div className="mb-5 text-[22px] font-bold text-ink">Impostazioni</div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Panel>
          <div className="mb-3 text-[15.5px] font-bold text-ink">Dati condominio</div>
          <FieldGroup>
            <Label htmlFor="settings-name">Nome</Label>
            <Input id="settings-name" value={condoName} onChange={(e) => setCondoName(e.target.value)} />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="settings-address">Indirizzo</Label>
            <Input id="settings-address" value={address} onChange={(e) => setAddress(e.target.value)} />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="settings-vat">Codice fiscale</Label>
            <Input id="settings-vat" value={taxCode} onChange={(e) => setTaxCode(e.target.value)} />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="settings-iban">IBAN</Label>
            <Input id="settings-iban" value={iban} onChange={(e) => setIban(e.target.value)} />
          </FieldGroup>

          <div className="flex items-center justify-between border-t border-border py-2.5 text-[13.5px]">
            <span className="font-semibold text-sub">Numero di unità abitative</span>
            <span className="font-semibold text-ink">{units.length} (da Unità)</span>
          </div>

          <FormError message={configError} />
          {configSaved && !configError && (
            <p className="-mt-1 mb-3 text-[13.5px] font-semibold text-success">Modifiche salvate.</p>
          )}
          <Button onClick={handleSaveConfig} disabled={configSaving} className="mt-2">
            {configSaving ? "Salvataggio…" : "Salva modifiche"}
          </Button>
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
                  disabled={splitSaving}
                  onClick={() => handleSelectSplit(option.key)}
                  className="flex min-h-11 w-full items-center gap-2.5 border-t border-border py-2.5 text-left disabled:opacity-60"
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
          <p className="mb-2 text-xs text-sub">
            Non ancora collegate a un sistema di notifiche reale: solo anteprima.
          </p>
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
          {profiles.map((profile) => (
            <div key={profile.id} className="flex items-center gap-2.5 border-t border-border py-2.5">
              <Avatar name={profile.full_name} size="sm" />
              <div>
                <div className="text-[13.5px] font-semibold text-ink">{profile.full_name}</div>
                <div className="text-xs text-sub">
                  {roleLabel(profile.role)}
                  {unitLabelOf(profile) ? ` · ${unitLabelOf(profile)}` : ""}
                </div>
              </div>
            </div>
          ))}
          {profiles.length === 0 && <p className="py-4 text-center text-sm text-sub">Nessun utente.</p>}
        </Panel>
      </div>

      <Modal
        open={modalOpen}
        title="Nuovo utente"
        onClose={() => setModalOpen(false)}
        onSave={handleInvite}
        error={inviteError}
        saveLabel={inviteSaving ? "Invio invito…" : "Invita"}
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
          <Label htmlFor="new-user-email">Email</Label>
          <Input
            id="new-user-email"
            type="email"
            placeholder="nome@esempio.it"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
          />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="new-user-role">Ruolo</Label>
          <Select id="new-user-role" value={userRole} onChange={(e) => setUserRole(e.target.value as Role)}>
            {roleOptions.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </Select>
        </FieldGroup>
        {userRole === "condomino" && (
          <FieldGroup>
            <Label htmlFor="new-user-unit">Unità collegata</Label>
            <Select id="new-user-unit" value={userUnitId} onChange={(e) => setUserUnitId(e.target.value)}>
              <option value="">Seleziona un&apos;unità…</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </Select>
          </FieldGroup>
        )}
      </Modal>
    </div>
  );
}
