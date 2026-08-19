"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatEventDateTime } from "@/lib/utils";
import type { EventWithSignups } from "@/types/database.types";

interface EventsBoardProps {
  events: EventWithSignups[];
  currentUserId: string;
}

export default function EventsBoard({ events, currentUserId }: EventsBoardProps) {
  const router = useRouter();
  const [busyEventId, setBusyEventId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Mantiene los cupos actualizados en vivo si otro empleado se inscribe/cancela.
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("employee-signups-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "event_signups" }, () => {
        router.refresh();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  async function toggleSignup(event: EventWithSignups, isSignedUp: boolean) {
    setBusyEventId(event.id);
    setError(null);

    const res = isSignedUp
      ? await fetch(`/api/signups?event_id=${event.id}`, { method: "DELETE" })
      : await fetch("/api/signups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ event_id: event.id })
        });

    setBusyEventId(null);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Ocurrió un error, intenta de nuevo.");
      return;
    }

    router.refresh();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Eventos disponibles</h1>
      <p className="mt-1 text-sm text-slate-400">Inscríbete a los eventos en los que quieras trabajar.</p>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      <div className="mt-6 space-y-3">
        {events.length === 0 && <p className="text-sm text-slate-500">No hay eventos disponibles por ahora.</p>}
        {events.map((event) => {
          const signups = event.event_signups ?? [];
          const isSignedUp = signups.some((s) => s.employee_id === currentUserId);
          const isFull = signups.length >= event.max_staff;
          const cuposDisponibles = event.max_staff - signups.length;

          return (
            <div key={event.id} className="card">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <p className="font-medium text-white">{event.name}</p>
                  <p className="text-sm text-slate-400">{formatEventDateTime(event.start_time)}</p>
                  <p className="text-sm text-slate-400">{event.location}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {signups.length}/{event.max_staff} inscritos ·{" "}
                    {isFull ? "Sin cupo" : `${cuposDisponibles} cupo(s) disponible(s)`}
                  </p>
                </div>
                <button
                  onClick={() => toggleSignup(event, isSignedUp)}
                  disabled={busyEventId === event.id || (!isSignedUp && isFull)}
                  className={
                    isSignedUp
                      ? "rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/20 disabled:opacity-60"
                      : "btn-primary !px-4 !py-2 text-sm disabled:opacity-40"
                  }
                >
                  {busyEventId === event.id
                    ? "Procesando..."
                    : isSignedUp
                    ? "Cancelar inscripción"
                    : isFull
                    ? "Sin cupo"
                    : "Inscribirme"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
