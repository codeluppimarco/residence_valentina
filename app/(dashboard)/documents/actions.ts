"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type CreateDocumentInput = {
  title: string;
  docType: string;
  storagePath: string;
};

// Il file va già caricato su Storage lato client (upload diretto, per non
// passare l'intero contenuto attraverso il body della Server Action); qui
// registriamo solo la riga in "documents" una volta che lo storage_path
// esiste davvero.
export async function createDocumentRecord(input: CreateDocumentInput): Promise<{ error?: string }> {
  if (!input.title.trim()) {
    return { error: "Il titolo è obbligatorio." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("documents").insert({
    title: input.title,
    doc_type: input.docType,
    storage_path: input.storagePath,
    uploaded_by: user?.id ?? null,
  });

  if (error) {
    await supabase.storage.from("documents").remove([input.storagePath]);
    return { error: error.message };
  }

  revalidatePath("/documents");
  return {};
}
