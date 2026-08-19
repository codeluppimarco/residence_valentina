"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Role, SplitMethod } from "@/lib/db-types";

type UpdateConfigInput = {
  condoName: string;
  address: string;
  taxCode: string;
  iban: string;
};

export async function updateConfig(input: UpdateConfigInput): Promise<{ error?: string }> {
  if (!input.condoName.trim()) {
    return { error: "Il nome del condominio è obbligatorio." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("config")
    .update({
      condo_name: input.condoName,
      address: input.address || null,
      tax_code: input.taxCode || null,
      iban: input.iban || null,
    })
    .eq("id", 1);

  if (error) return { error: error.message };

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return {};
}

export async function updateSplitMethod(method: SplitMethod): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("config").update({ default_split_method: method }).eq("id", 1);
  if (error) return { error: error.message };

  revalidatePath("/settings");
  revalidatePath("/expenses/new");
  return {};
}

type InviteUserInput = {
  fullName: string;
  email: string;
  role: Role;
  unitId: string | null;
};

export async function inviteUser(input: InviteUserInput): Promise<{ error?: string }> {
  if (!input.fullName.trim() || !input.email.trim()) {
    return { error: "Nome ed email sono obbligatori." };
  }
  if (input.role === "condomino" && !input.unitId) {
    return { error: "Seleziona un'unità per un residente." };
  }

  // createAdminClient() bypassa la RLS (service role): l'autorizzazione va
  // verificata qui esplicitamente, non lasciata alla RLS come per le altre
  // Server Action di questo progetto.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non autenticato." };

  const { data: callerProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (callerProfile?.role !== "admin") {
    return { error: "Solo un amministratore può invitare nuovi utenti." };
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.inviteUserByEmail(input.email, {
    data: {
      full_name: input.fullName,
      role: input.role,
      unit_id: input.unitId,
    },
  });

  if (error) return { error: error.message };

  revalidatePath("/settings");
  return {};
}
