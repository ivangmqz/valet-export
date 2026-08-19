"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";
import EventForm from "@/components/admin/EventForm";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { formatEventDateTime } from "@/lib/utils";
import type { EventWithSignups } from "@/types/database.types";

export default function EventDetail({ event }: { event: EventWithSignups }) {
  const router = useRouter();
  const [showEdit, setShowEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`¿Eliminar el evento "${event.name}"? Esta acción no se puede deshacer.`)) return;
    setDeleting(true);
    const res = await fetch(`/api/events/${event.id}`, { method: "DELETE" });
    setDeleting(false);
    if (res.ok) router.push("/admin/events");
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{event.name}</h1>
          <p className="mt-1 text-slate-400">{formatEventDateTime(event.start_time)}</p>
          <p className="text-slate-400">{event.location}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowEdit(true)} className="btn-secondary !px-4 !py-2 text-sm">
            Editar
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/20 disabled:opacity-60"
          >
            {deleting ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-3">
        <div className="card">
          <p className="text-xs uppercase text-slate-500">Cupos</p>
          <p className="mt-1 text-2xl font-bold text-white">
            {event.event_signups?.length ?? 0}/{event.max_staff}
          </p>
        </div>
        <div className="card">
          <p className="text-xs uppercase text-slate-500">Cliente</p>
          <p className="mt-1 font-medium text-white">{event.client_name || "—"}</p>
          {event.client_phone && (
            <a
              href={buildWhatsAppLink(`Hola, te contacto sobre el evento "${event.name}".`, event.client_phone)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-xs text-emerald-400 hover:underline"
            >
              Escribir por WhatsApp →
            </a>
          )}
        </div>
        <div className="card">
          <p className="text-xs uppercase text-slate-500">Estado</p>
          <p className="mt-1 font-medium capitalize text-white">{event.status}</p>
        </div>
      </div>

      {event.internal_notes && (
        <div className="card mt-5">
          <p className="text-xs uppercase text-slate-500">Notas operativas internas</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-slate-200">{event.internal_notes}</p>
        </div>
      )}

      <h2 className="mt-8 text-lg font-semibold text-white">Empleados inscritos</h2>
      <div className="mt-3 space-y-2">
        {(event.event_signups ?? []).length === 0 && (
          <p className="text-sm text-slate-500">Ningún empleado se ha inscrito todavía.</p>
        )}
        {(event.event_signups ?? []).map((signup) => (
          <div key={signup.id} className="card flex items-center justify-between">
            <div>
              <p className="font-medium text-white">{signup.profiles.full_name}</p>
              <p className="text-xs text-slate-500">{signup.profiles.phone || "Sin teléfono"}</p>
            </div>
            {signup.profiles.phone && (
              <a
                href={buildWhatsAppLink(
                  `Hola ${signup.profiles.full_name}, te contacto por el evento "${event.name}".`,
                  signup.profiles.phone
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-emerald-400 hover:underline"
              >
                WhatsApp →
              </a>
            )}
          </div>
        ))}
      </div>

      {showEdit && (
        <Modal title="Editar evento" onClose={() => setShowEdit(false)}>
          <EventForm event={event} onDone={() => setShowEdit(false)} />
        </Modal>
      )}
    </div>
  );
}
