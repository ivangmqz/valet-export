"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { formatShortDateTime } from "@/lib/utils";
import type { AlertWithEvent } from "@/types/database.types";

interface AlertBannerProps {
  initialAlerts: AlertWithEvent[];
}

/**
 * Muestra las alertas críticas de "12 horas antes del evento" y se
 * mantiene sincronizado en vivo vía Supabase Realtime: cuando el cron
 * job inserta una nueva alerta, aparece aquí sin recargar la página.
 */
export default function AlertBanner({ initialAlerts }: AlertBannerProps) {
  const [alerts, setAlerts] = useState(initialAlerts);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("alerts-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "alerts" },
        async (payload) => {
          const { data: event } = await supabase
            .from("events")
            .select("id, name, start_time, location, client_name, client_phone")
            .eq("id", payload.new.event_id)
            .single();
          if (!event) return;
          setAlerts((prev) => [{ ...(payload.new as AlertWithEvent), events: event }, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function acknowledge(alertId: string) {
    const supabase = createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    await supabase
      .from("alerts")
      .update({ acknowledged: true, acknowledged_by: user?.id, acknowledged_at: new Date().toISOString() })
      .eq("id", alertId);

    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  }

  const pending = alerts.filter((a) => !a.acknowledged);

  if (pending.length === 0) return null;

  return (
    <div className="mb-8 space-y-3">
      {pending.map((alert) => (
        <div
          key={alert.id}
          className="flex flex-col gap-3 rounded-2xl border border-red-500/40 bg-red-500/10 p-5 shadow-lg shadow-red-500/10 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-2xl">🚨</span>
            <div>
              <p className="font-semibold text-white">
                Faltan ~12 horas: {alert.events.name}
              </p>
              <p className="text-sm text-red-200/90">{alert.message}</p>
              <p className="mt-1 text-xs text-red-300/70">
                Evento: {formatShortDateTime(alert.events.start_time)} · {alert.events.location}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            {alert.events.client_phone && (
              <a
                href={buildWhatsAppLink(
                  `Hola, te contacto para confirmar tu asistencia al evento "${alert.events.name}" que inicia en 12 horas.`,
                  alert.events.client_phone
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp !px-3 !py-2 text-xs"
              >
                Llamar cliente
              </a>
            )}
            <button
              onClick={() => acknowledge(alert.id)}
              className="rounded-lg border border-white/20 px-3 py-2 text-xs font-medium text-white hover:bg-white/10"
            >
              Marcar confirmado
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
