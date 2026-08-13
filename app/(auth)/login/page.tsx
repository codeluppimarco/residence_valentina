"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LogoBadge } from "@/components/ui/LogoBadge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { FieldGroup } from "@/components/ui/FieldGroup";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push("/dashboard");
  }

  return (
    <div className="w-full max-w-[380px] rounded-2xl border border-border bg-surface p-8 shadow-login-card">
      <LogoBadge className="mb-4" />
      <div className="mb-1 text-[22px] font-bold text-ink">Residence Valentina</div>
      <div className="mb-6 text-sm leading-snug text-sub">
        Gestione condominiale — accesso amministratore
      </div>

      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <Label htmlFor="login-email">Email</Label>
          <Input
            id="login-email"
            type="email"
            placeholder="nome@residencevalentina.it"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="login-password">Password</Label>
          <Input
            id="login-password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </FieldGroup>
        <Button type="submit" variant="primary" size="md" fullWidth>
          Accedi
        </Button>
      </form>

      <div className="mt-4 flex flex-col items-center gap-2">
        <button type="button" className="text-[13px] font-semibold text-primary">
          Password dimenticata?
        </button>
        <button type="button" className="text-[13px] font-semibold text-primary">
          Richiedi accesso residente
        </button>
      </div>
    </div>
  );
}
