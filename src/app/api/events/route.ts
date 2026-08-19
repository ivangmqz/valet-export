import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** GET /api/events — lista eventos (cualquier usuario autenticado, RLS aplica). */
export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("*, event_signups(id, employee_id, signed_up_at, profiles(id, full_name, phone))")
    .order("start_time", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ events: data });
}

/** POST /api/events — crea un evento (solo admin, forzado por RLS `events_admin_all`). */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await request.json();
  const { name, start_time, end_time, location, max_staff, internal_notes, client_name, client_phone } = body;

  if (!name || !start_time || !location || !max_staff) {
    return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("events")
    .insert({
      name,
      start_time,
      end_time: end_time || null,
      location,
      max_staff,
      internal_notes: internal_notes || null,
      client_name: client_name || null,
      client_phone: client_phone || null,
      created_by: user.id
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ event: data }, { status: 201 });
}
