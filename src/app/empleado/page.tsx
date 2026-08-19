import { createClient } from "@/lib/supabase/server";
import EventsBoard from "@/components/empleado/EventsBoard";
import type { EventWithSignups } from "@/types/database.types";

export const dynamic = "force-dynamic";

export default async function EmpleadoPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data: events } = await supabase
    .from("events")
    .select("*, event_signups(id, employee_id, signed_up_at, profiles(id, full_name, phone))")
    .gte("start_time", new Date().toISOString())
    .neq("status", "cancelado")
    .order("start_time", { ascending: true });

  return <EventsBoard events={(events ?? []) as EventWithSignups[]} currentUserId={user!.id} />;
}
