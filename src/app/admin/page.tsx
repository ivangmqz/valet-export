import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AlertBanner from "@/components/AlertBanner";
import { formatShortDateTime } from "@/lib/utils";
import type { AlertWithEvent } from "@/types/database.types";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [{ data: alerts }, { data: upcomingEvents }, { data: employees }] = await Promise.all([
    supabase
      .from("alerts")
      .select("*, events(id, name, start_time, location, client_name, client_phone)")
      .eq("acknowledged", false)
      .order("created_at", { ascending: false }),
    supabase
      .from("events")
      .select("*, event_signups(id)")
      .gte("start_time", new Date().toISOString())
      .neq("status", "cancelado")
      .order("start_time", { ascending: true })
      .limit(6),
    supabase.from("profiles").select("id").eq("role", "empleado").eq("active", true)
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Panel del Administrador</h1>
      <p className="mt-1 text-sm text-slate-400">
        Resumen operativo y alertas críticas de confirmación.
      </p>

      <div className="mt-6">
        <AlertBanner initialAlerts={(alerts ?? []) as AlertWithEvent[]} />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <StatCard label="Empleados activos" value={employees?.length ?? 0} />
        <StatCard label="Próximos eventos" value={upcomingEvents?.length ?? 0} />
        <StatCard label="Alertas pendientes" value={alerts?.length ?? 0} accent="text-red-400" />
      </div>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Próximos eventos</h2>
        <Link href="/admin/events" className="text-sm text-valet-300 hover:underline">
          Ver todos →
        </Link>
      </div>

      <div className="mt-4 space-y-3">
        {(upcomingEvents ?? []).length === 0 && (
          <p className="text-sm text-slate-500">No hay eventos próximos programados.</p>
        )}
        {(upcomingEvents ?? []).map((event: any) => (
          <Link
            key={event.id}
            href={`/admin/events/${event.id}`}
            className="card flex items-center justify-between transition hover:border-valet-400/50"
          >
            <div>
              <p className="font-medium text-white">{event.name}</p>
              <p className="text-sm text-slate-400">
                {formatShortDateTime(event.start_time)} · {event.location}
              </p>
            </div>
            <div className="text-sm text-slate-300">
              {event.event_signups?.length ?? 0}/{event.max_staff} inscritos
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="card">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${accent ?? "text-white"}`}>{value}</p>
    </div>
  );
}
