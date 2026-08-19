import { createClient } from "@/lib/supabase/server";
import { formatEventDateTime, hoursUntil } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MisEventosPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data: signups } = await supabase
    .from("event_signups")
    .select("id, events(id, name, start_time, location, status)")
    .eq("employee_id", user!.id)
    .order("start_time", { foreignTable: "events", ascending: true });

  const upcoming = (signups ?? [])
    .filter((s: any) => s.events && new Date(s.events.start_time).getTime() > Date.now())
    .sort((a: any, b: any) => new Date(a.events.start_time).getTime() - new Date(b.events.start_time).getTime());
  const next = upcoming[0];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Mis eventos</h1>
      <p className="mt-1 text-sm text-slate-400">Eventos a los que estás inscrito.</p>

      {next && (
        <div className="mt-6 rounded-2xl border border-gold-500/30 bg-gold-500/10 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-gold-400">Tu próximo evento</p>
          <p className="mt-1 text-lg font-semibold text-white">{next.events.name}</p>
          <p className="text-sm text-slate-300">{formatEventDateTime(next.events.start_time)}</p>
          <p className="text-sm text-slate-300">{next.events.location}</p>
          <p className="mt-2 text-xs text-slate-400">
            Faltan {Math.max(0, Math.round(hoursUntil(next.events.start_time)))} horas aproximadamente.
          </p>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {upcoming.length === 0 && (
          <p className="text-sm text-slate-500">Aún no te has inscrito a ningún evento próximo.</p>
        )}
        {upcoming.map((s: any) => (
          <div key={s.id} className="card">
            <p className="font-medium text-white">{s.events.name}</p>
            <p className="text-sm text-slate-400">{formatEventDateTime(s.events.start_time)}</p>
            <p className="text-sm text-slate-400">{s.events.location}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
