import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * GET /api/cron/check-alerts
 *
 * Disparador de las "alertas de 12 horas". Pensado para ser invocado por
 * Vercel Cron (ver vercel.json) cada 15 minutos. Por cada evento cuyo
 * `start_time` caiga dentro de la ventana [11h45m, 12h15m] desde "ahora",
 * inserta una alerta crítica en la tabla `alerts` para que el panel del
 * administrador la muestre destacada (recordatorio de llamar a empleados
 * y cliente para confirmar asistencia final).
 *
 * La combinación de:
 *   1) ventana de 30 min (coincide con la cadencia del cron de 15 min +
 *      margen), y
 *   2) el UNIQUE(event_id, type) en la tabla `alerts`
 * garantiza que cada evento reciba esta alerta EXACTAMENTE una vez,
 * incluso si el cron corre más de una vez dentro de la ventana.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const supabase = createAdminClient();

  const now = Date.now();
  const windowStart = new Date(now + 11.75 * 60 * 60 * 1000).toISOString(); // +11h45m
  const windowEnd = new Date(now + 12.25 * 60 * 60 * 1000).toISOString(); // +12h15m

  const { data: events, error: eventsError } = await supabase
    .from("events")
    .select("id, name, start_time, location, client_name, client_phone")
    .gte("start_time", windowStart)
    .lte("start_time", windowEnd)
    .neq("status", "cancelado");

  if (eventsError) {
    return NextResponse.json({ error: eventsError.message }, { status: 500 });
  }

  if (!events || events.length === 0) {
    return NextResponse.json({ checked: 0, created: 0 });
  }

  const alertsToInsert = events.map((event) => ({
    event_id: event.id,
    type: "12h_reminder",
    message: `Faltan 12 horas para "${event.name}" (${event.location}). Llama a los empleados inscritos${
      event.client_name ? ` y a ${event.client_name}` : " y al cliente"
    } para confirmar la asistencia final.`
  }));

  // onConflict evita duplicados gracias al UNIQUE(event_id, type) del esquema
  const { data: inserted, error: insertError } = await supabase
    .from("alerts")
    .upsert(alertsToInsert, { onConflict: "event_id,type", ignoreDuplicates: true })
    .select();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ checked: events.length, created: inserted?.length ?? 0 });
}
