import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EventDetail from "@/components/admin/EventDetail";
import type { EventWithSignups } from "@/types/database.types";

export const dynamic = "force-dynamic";

export default async function AdminEventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: event } = await supabase
    .from("events")
    .select("*, event_signups(id, employee_id, signed_up_at, profiles(id, full_name, phone))")
    .eq("id", id)
    .single();

  if (!event) notFound();

  return <EventDetail event={event as EventWithSignups} />;
}
