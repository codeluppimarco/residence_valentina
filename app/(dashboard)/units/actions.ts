"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type CreateUnitInput = {
  label: string;
  ownerName: string;
  floor: string;
  millesimi: number;
  residentCount: number;
  isActive: boolean;
};

export async function createUnit(input: CreateUnitInput): Promise<{ error?: string }> {
  if (!input.label.trim() || !input.ownerName.trim()) {
    return { error: "Unità e proprietario sono obbligatori." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("units").insert({
    label: input.label,
    owner_name: input.ownerName,
    floor: input.floor || null,
    millesimi: input.millesimi,
    resident_count: input.residentCount,
    is_active: input.isActive,
  });

  if (error) return { error: error.message };

  revalidatePath("/units");
  return {};
}

type UpdateUnitInput = CreateUnitInput & { id: string };

export async function updateUnit(input: UpdateUnitInput): Promise<{ error?: string }> {
  if (!input.label.trim() || !input.ownerName.trim()) {
    return { error: "Unità e proprietario sono obbligatori." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("units")
    .update({
      label: input.label,
      owner_name: input.ownerName,
      floor: input.floor || null,
      millesimi: input.millesimi,
      resident_count: input.residentCount,
      is_active: input.isActive,
    })
    .eq("id", input.id);

  if (error) return { error: error.message };

  revalidatePath("/units");
  revalidatePath("/dashboard");
  revalidatePath("/expenses/new");
  return {};
}

export async function deleteUnit(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("units").delete().eq("id", id);

  // Fallisce con un errore chiaro se l'unità ha ancora un residente
  // assegnato (constraint su profiles) — comportamento voluto, non va
  // "forzato": prima bisogna riassegnare o eliminare quel profilo.
  if (error) return { error: error.message };

  revalidatePath("/units");
  revalidatePath("/dashboard");
  revalidatePath("/expenses/new");
  return {};
}
