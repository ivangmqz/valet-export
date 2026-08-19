import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Event } from "@/types/database.types";

interface Params {
  params: Promise<{ id: string }>;
}

const ALLOWED_EVENT_FIELDS = [
  "name",
  "start_time",
  "end_time",
  "location",
  "max_staff",
  "internal_notes",
  "client_name",
  "client_phone",
  "status"
] as const satisfies readonly (keyof Event)[];

/** PATCH /api/events/:id — edita un evento (solo admin, forzado por RLS). */
export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const body = await request.json();

  const updates: Partial<Event> = {};
  for (const field of ALLOWED_EVENT_FIELDS) {
    if (field in body) (updates as Record<string, unknown>)[field] = body[field];
  }

  const { data, error } = await supabase
    .from("events")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ event: data });
}

/** DELETE /api/events/:id — elimina un evento (solo admin, forzado por RLS). */
export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const { error } = await supabase.from("events").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
