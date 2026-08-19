"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type CreateReportInput = {
  title: string;
  unitLabel: string;
  description: string;
};

export async function createReport(input: CreateReportInput): Promise<{ error?: string }> {
  if (!input.title.trim()) {
    return { error: "Il titolo è obbligatorio." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("reports").insert({
    title: input.title,
    unit_label: input.unitLabel || "Parti comuni",
    description: input.description || null,
    created_by: user?.id ?? null,
  });

  if (error) return { error: error.message };

  revalidatePath("/reports");
  revalidatePath("/dashboard");
  return {};
}

type UpdateReportInput = {
  id: string;
  title: string;
  unitLabel: string;
  description: string;
  status: string;
  assignee: string;
};

export async function updateReport(input: UpdateReportInput): Promise<{ error?: string }> {
  if (!input.title.trim()) {
    return { error: "Il titolo è obbligatorio." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("reports")
    .update({
      title: input.title,
      unit_label: input.unitLabel || "Parti comuni",
      description: input.description || null,
      status: input.status,
      assignee: input.assignee || null,
    })
    .eq("id", input.id);

  if (error) return { error: error.message };

  revalidatePath("/reports");
  revalidatePath("/dashboard");
  return {};
}

export async function deleteReport(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("reports").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/reports");
  revalidatePath("/dashboard");
  return {};
}
