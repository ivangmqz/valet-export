import { createClient } from "@/lib/supabase/server";
import EventsList from "@/components/admin/EventsList";
import type { EventWithSignups } from "@/types/database.types";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const supabase = await createClient();
  const { data: events } = await supabase
    .from("events")
    .select("*, event_signups(id, employee_id, signed_up_at, profiles(id, full_name, phone))")
    .order("start_time", { ascending: true });

  return <EventsList events={(events ?? []) as EventWithSignups[]} />;
}
