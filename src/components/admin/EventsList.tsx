"use client";

import { useState } from "react";
import Link from "next/link";
import Modal from "@/components/Modal";
import EventForm from "@/components/admin/EventForm";
import { formatShortDateTime } from "@/lib/utils";
import type { EventWithSignups } from "@/types/database.types";

const STATUS_LABEL: Record<string, string> = {
  programado: "Programado",
  confirmado: "Confirmado",
  finalizado: "Finalizado",
  cancelado: "Cancelado"
};

const STATUS_COLOR: Record<string, string> = {
  programado: "bg-blue-500/15 text-blue-300",
  confirmado: "bg-emerald-500/15 text-emerald-300",
  finalizado: "bg-slate-500/15 text-slate-300",
  cancelado: "bg-red-500/15 text-red-300"
};

export default function EventsList({ events }: { events: EventWithSignups[] }) {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Eventos</h1>
        <button onClick={() => setShowCreate(true)} className="btn-primary !px-4 !py-2 text-sm">
          + Nuevo evento
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {events.length === 0 && <p className="text-sm text-slate-500">Aún no hay eventos creados.</p>}
        {events.map((event) => (
          <Link
            key={event.id}
            href={`/admin/events/${event.id}`}
            className="card flex flex-col gap-2 transition hover:border-valet-400/50 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-white">{event.name}</p>
                <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_COLOR[event.status]}`}>
                  {STATUS_LABEL[event.status]}
                </span>
              </div>
              <p className="text-sm text-slate-400">
                {formatShortDateTime(event.start_time)} · {event.location}
              </p>
            </div>
            <div className="text-sm font-medium text-slate-300">
              {event.event_signups?.length ?? 0}/{event.max_staff} inscritos
            </div>
          </Link>
        ))}
      </div>

      {showCreate && (
        <Modal title="Nuevo evento" onClose={() => setShowCreate(false)}>
          <EventForm onDone={() => setShowCreate(false)} />
        </Modal>
      )}
    </div>
  );
}
