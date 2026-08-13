"use client";

import { useState } from "react";
import { Panel } from "@/components/ui/Panel";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { FieldGroup } from "@/components/ui/FieldGroup";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { currentUser } from "@/lib/mock-data";

type ActiveModal = "profile" | "password" | null;

export default function ProfilePage() {
  const [profile, setProfile] = useState(currentUser);
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [error, setError] = useState("");

  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);

  const [currentPassword, setCurrentPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  function openProfileModal() {
    setName(profile.name);
    setEmail(profile.email);
    setPhone(profile.phone);
    setError("");
    setActiveModal("profile");
  }

  function openPasswordModal() {
    setCurrentPassword("");
    setNextPassword("");
    setConfirmPassword("");
    setError("");
    setActiveModal("password");
  }

  function handleSaveProfile() {
    if (!name.trim() || !email.trim()) {
      setError("Nome e email sono obbligatori.");
      return;
    }
    setProfile((prev) => ({ ...prev, name, email, phone }));
    setActiveModal(null);
  }

  function handleSavePassword() {
    if (!currentPassword || !nextPassword || !confirmPassword) {
      setError("Compila tutti i campi.");
      return;
    }
    if (nextPassword !== confirmPassword) {
      setError("Le nuove password non coincidono.");
      return;
    }
    setActiveModal(null);
  }

  return (
    <div>
      <Panel className="max-w-[420px] p-7">
        <Avatar name={profile.name} size="lg" className="mb-3.5" />
        <div className="text-lg font-bold text-ink">{profile.name}</div>
        <div className="mb-4 text-[13.5px] text-sub">{profile.roleLabel}</div>

        <div className="flex justify-between border-t border-border py-2.5 text-[13.5px]">
          <span className="font-semibold text-sub">Email</span>
          <span className="font-semibold text-ink">{profile.email}</span>
        </div>
        <div className="flex justify-between border-t border-border py-2.5 text-[13.5px]">
          <span className="font-semibold text-sub">Telefono</span>
          <span className="font-semibold text-ink">{profile.phone}</span>
        </div>
        <div className="flex justify-between border-t border-border py-2.5 text-[13.5px]">
          <span className="font-semibold text-sub">Condominio gestito</span>
          <span className="font-semibold text-ink">Residence Valentina</span>
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
      >
        <FieldGroup>
          <Label htmlFor="profile-name">Nome</Label>
          <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="profile-email">Email</Label>
          <Input id="profile-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
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
