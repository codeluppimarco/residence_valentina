"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { Modal } from "@/components/ui/Modal";
import { FieldGroup } from "@/components/ui/FieldGroup";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { eventTypeLabel, formatDate } from "@/lib/format";
import type { EventRow } from "@/lib/db-types";
import { createEvent, deleteEvent, updateEvent } from "./actions";

const eventTypes = ["assemblea", "scadenza", "manutenzione", "altro"];

type EventsViewProps = {
  events: EventRow[];
};

export function EventsView({ events }: EventsViewProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventType, setEventType] = useState("altro");
  const [description, setDescription] = useState("");

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = events.filter((e) => e.event_date >= today);
  const past = events.filter((e) => e.event_date < today);

  function openCreateModal() {
    setEditingEvent(null);
    setTitle("");
    setEventDate("");
    setEventType("altro");
    setDescription("");
    setError("");
    setModalOpen(true);
  }

  function openEditModal(event: EventRow) {
    setEditingEvent(event);
    setTitle(event.title);
    setEventDate(event.event_date);
    setEventType(event.event_type);
    setDescription(event.description ?? "");
    setError("");
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    const input = { title, eventDate, eventType, description };
    const result = editingEvent ? await updateEvent(editingEvent.id, input) : await createEvent(input);
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setModalOpen(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!editingEvent) return;
    const confirmed = window.confirm(`Eliminare l'evento "${editingEvent.title}"? Non è reversibile.`);
    if (!confirmed) return;
    setSaving(true);
    const result = await deleteEvent(editingEvent.id);
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setModalOpen(false);
    router.refresh();
  }

  function renderEvent(event: EventRow) {
    return (
      <Panel key={event.id} className="cursor-pointer p-4 hover:bg-bg sm:p-5" onClick={() => openEditModal(event)}>
        <div className="flex items-start justify-between gap-3">
          <div className="text-[15px] font-bold text-ink">{event.title}</div>
          <span className="inline-block rounded-pill bg-primary-soft px-2.5 py-1 text-[11.5px] font-bold text-primary-dark">
            {eventTypeLabel(event.event_type)}
          </span>
        </div>
        <div className="mt-2 text-[13px] text-sub">
          {formatDate(event.event_date)}
          {event.description ? ` · ${event.description}` : ""}
        </div>
      </Panel>
    );
  }

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="text-[22px] font-bold text-ink">Eventi</div>
          <div className="mt-1 text-[13.5px] text-sub">Assemblee, scadenze e altri appuntamenti del condominio</div>
        </div>
        <Button onClick={openCreateModal}>+ Nuovo evento</Button>
      </div>

      <div className="flex flex-col gap-3">
        {upcoming.map(renderEvent)}
        {upcoming.length === 0 && <p className="py-4 text-center text-sm text-sub">Nessun evento futuro.</p>}
      </div>

      {past.length > 0 && (
        <>
          <div className="mb-3 mt-7 text-[13px] font-bold uppercase tracking-wide text-sub">Passati</div>
          <div className="flex flex-col gap-3 opacity-70">{past.map(renderEvent)}</div>
        </>
      )}

      <Modal
        open={modalOpen}
        title={editingEvent ? "Modifica evento" : "Nuovo evento"}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        error={error}
        saveLabel={saving ? "Salvataggio…" : "Salva"}
        onDelete={editingEvent ? handleDelete : undefined}
      >
        <FieldGroup>
          <Label htmlFor="event-title">Titolo</Label>
          <Input
            id="event-title"
            placeholder="Es. Assemblea ordinaria"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="event-date">Data</Label>
          <Input id="event-date" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="event-type">Tipo</Label>
          <Select id="event-type" value={eventType} onChange={(e) => setEventType(e.target.value)}>
            {eventTypes.map((t) => (
              <option key={t} value={t}>
                {eventTypeLabel(t)}
              </option>
            ))}
          </Select>
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="event-description">Descrizione</Label>
          <Textarea
            id="event-description"
            placeholder="Note aggiuntive (opzionale)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </FieldGroup>
      </Modal>
    </div>
  );
}
