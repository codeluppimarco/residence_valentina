"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type EventInput = {
  title: string;
  eventDate: string;
  eventType: string;
  description: string;
};

export async function createEvent(input: EventInput): Promise<{ error?: string }> {
  if (!input.title.trim() || !input.eventDate) {
    return { error: "Titolo e data sono obbligatori." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("events").insert({
    title: input.title,
    event_date: input.eventDate,
    event_type: input.eventType,
    description: input.description || null,
    created_by: user?.id ?? null,
  });

  if (error) return { error: error.message };

  revalidatePath("/events");
  revalidatePath("/dashboard");
  return {};
}

export async function updateEvent(id: string, input: EventInput): Promise<{ error?: string }> {
  if (!input.title.trim() || !input.eventDate) {
    return { error: "Titolo e data sono obbligatori." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("events")
    .update({
      title: input.title,
      event_date: input.eventDate,
      event_type: input.eventType,
      description: input.description || null,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/events");
  revalidatePath("/dashboard");
  return {};
}

export async function deleteEvent(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/events");
  revalidatePath("/dashboard");
  return {};
}
