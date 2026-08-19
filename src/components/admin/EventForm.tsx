"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Event } from "@/types/database.types";

interface EventFormProps {
  event?: Event;
  onDone?: () => void;
}

function toLocalInputValue(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EventForm({ event, onDone }: EventFormProps) {
  const router = useRouter();
  const isEditing = Boolean(event);

  const [form, setForm] = useState({
    name: event?.name ?? "",
    start_time: toLocalInputValue(event?.start_time),
    location: event?.location ?? "",
    max_staff: event?.max_staff ?? 1,
    internal_notes: event?.internal_notes ?? "",
    client_name: event?.client_name ?? "",
    client_phone: event?.client_phone ?? ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      ...form,
      max_staff: Number(form.max_staff),
      start_time: new Date(form.start_time).toISOString()
    };

    const res = await fetch(isEditing ? `/api/events/${event!.id}` : "/api/events", {
      method: isEditing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Ocurrió un error al guardar el evento.");
      return;
    }

    router.refresh();
    onDone?.();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label" htmlFor="name">
          Nombre del evento
        </label>
        <input
          id="name"
          required
          className="input"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="start_time">
            Fecha y hora exacta
          </label>
          <input
            id="start_time"
            type="datetime-local"
            required
            className="input"
            value={form.start_time}
            onChange={(e) => setForm({ ...form, start_time: e.target.value })}
          />
        </div>
        <div>
          <label className="label" htmlFor="max_staff">
            Cupos máximos de personal
          </label>
          <input
            id="max_staff"
            type="number"
            min={1}
            required
            className="input"
            value={form.max_staff}
            onChange={(e) => setForm({ ...form, max_staff: Number(e.target.value) })}
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="location">
          Ubicación / Dirección
        </label>
        <input
          id="location"
          required
          className="input"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="client_name">
            Nombre del cliente
          </label>
          <input
            id="client_name"
            className="input"
            value={form.client_name}
            onChange={(e) => setForm({ ...form, client_name: e.target.value })}
          />
        </div>
        <div>
          <label className="label" htmlFor="client_phone">
            Teléfono del cliente (para WhatsApp)
          </label>
          <input
            id="client_phone"
            placeholder="521234567890"
            className="input"
            value={form.client_phone}
            onChange={(e) => setForm({ ...form, client_phone: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="internal_notes">
          Notas operativas internas
        </label>
        <textarea
          id="internal_notes"
          rows={3}
          className="input"
          value={form.internal_notes}
          onChange={(e) => setForm({ ...form, internal_notes: e.target.value })}
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
        {loading ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear evento"}
      </button>
    </form>
  );
}
