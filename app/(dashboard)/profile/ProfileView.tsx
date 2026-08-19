"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Panel } from "@/components/ui/Panel";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { FieldGroup } from "@/components/ui/FieldGroup";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { roleLabel } from "@/lib/format";
import type { ProfileRow } from "@/lib/db-types";
import { createClient } from "@/lib/supabase/client";

type ActiveModal = "profile" | "password" | null;

type ProfileViewProps = {
  profile: ProfileRow;
  email: string;
  condoName: string;
};

export function ProfileView({ profile, email, condoName }: ProfileViewProps) {
  const router = useRouter();
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState(profile.full_name);
  const [newEmail, setNewEmail] = useState(email);
  const [phone, setPhone] = useState(profile.phone ?? "");

  const [currentPassword, setCurrentPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  function openProfileModal() {
    setName(profile.full_name);
    setNewEmail(email);
    setPhone(profile.phone ?? "");
    setError("");
    setInfo("");
    setActiveModal("profile");
  }

  function openPasswordModal() {
    setCurrentPassword("");
    setNextPassword("");
    setConfirmPassword("");
    setError("");
    setActiveModal("password");
  }

  async function handleSaveProfile() {
    if (!name.trim() || !newEmail.trim()) {
      setError("Nome e email sono obbligatori.");
      return;
    }
    setSaving(true);
    const supabase = createClient();

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ full_name: name, phone: phone || null })
      .eq("id", profile.id);
    if (profileError) {
      setSaving(false);
      setError(profileError.message);
      return;
    }

    if (newEmail !== email) {
      const { error: emailError } = await supabase.auth.updateUser({ email: newEmail });
      setSaving(false);
      if (emailError) {
        setError(emailError.message);
        return;
      }
      // L'email in auth.users non cambia finché non si conferma dal link
      // ricevuto: teniamo il modale aperto per mostrarlo, non chiudiamo come
      // se fosse già stata applicata.
      setInfo("Controlla la casella del nuovo indirizzo per confermare il cambio email.");
      router.refresh();
      return;
    }

    setSaving(false);
    setActiveModal(null);
    router.refresh();
  }

  async function handleSavePassword() {
    if (!currentPassword || !nextPassword || !confirmPassword) {
      setError("Compila tutti i campi.");
      return;
    }
    if (nextPassword !== confirmPassword) {
      setError("Le nuove password non coincidono.");
      return;
    }
    setSaving(true);
    const supabase = createClient();

    const { error: reauthError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    });
    if (reauthError) {
      setSaving(false);
      setError("Password attuale non corretta.");
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: nextPassword });
    setSaving(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setActiveModal(null);
  }

  return (
    <div>
      <Panel className="max-w-[420px] p-7">
        <Avatar name={profile.full_name} size="lg" className="mb-3.5" />
        <div className="text-lg font-bold text-ink">{profile.full_name}</div>
        <div className="mb-4 text-[13.5px] text-sub">{roleLabel(profile.role)}</div>

        <div className="flex justify-between border-t border-border py-2.5 text-[13.5px]">
          <span className="font-semibold text-sub">Email</span>
          <span className="font-semibold text-ink">{email}</span>
        </div>
        <div className="flex justify-between border-t border-border py-2.5 text-[13.5px]">
          <span className="font-semibold text-sub">Telefono</span>
          <span className="font-semibold text-ink">{profile.phone || "—"}</span>
        </div>
        <div className="flex justify-between border-t border-border py-2.5 text-[13.5px]">
          <span className="font-semibold text-sub">Condominio gestito</span>
          <span className="font-semibold text-ink">{condoName}</span>
        </div>

        <div className="mt-5 flex gap-2.5">
          <Button variant="secondary" onClick={openProfileModal}>
            Modifica profilo
          </Button>
          <Button variant="secondary" onClick={openPasswordModal}>
            Cambia password
          </Button>
        </div>
      </Panel>

      <Modal
        open={activeModal === "profile"}
        title="Modifica profilo"
        onClose={() => setActiveModal(null)}
        onSave={handleSaveProfile}
        error={error}
        saveLabel={saving ? "Salvataggio…" : "Salva"}
      >
        {info && <p className="mb-3 text-[13.5px] text-success">{info}</p>}
        <FieldGroup>
          <Label htmlFor="profile-name">Nome</Label>
          <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="profile-email">Email</Label>
          <Input id="profile-email" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="profile-phone">Telefono</Label>
          <Input id="profile-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </FieldGroup>
      </Modal>

      <Modal
        open={activeModal === "password"}
        title="Cambia password"
        onClose={() => setActiveModal(null)}
        onSave={handleSavePassword}
        error={error}
        saveLabel={saving ? "Salvataggio…" : "Salva"}
      >
        <FieldGroup>
          <Label htmlFor="password-current">Password attuale</Label>
          <Input
            id="password-current"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="password-next">Nuova password</Label>
          <Input
            id="password-next"
            type="password"
            value={nextPassword}
            onChange={(e) => setNextPassword(e.target.value)}
          />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="password-confirm">Conferma nuova password</Label>
          <Input
            id="password-confirm"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </FieldGroup>
      </Modal>
    </div>
  );
}
