import { createClient } from "@/lib/supabase/server";
import { EventsView } from "./EventsView";

export default async function EventsPage() {
  const supabase = await createClient();
  const { data: events } = await supabase.from("events").select("*").order("event_date", { ascending: true });

  return <EventsView events={events ?? []} />;
}
