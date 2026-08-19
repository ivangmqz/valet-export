import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** POST /api/signups — inscribe al empleado autenticado a un evento (cupos vía RPC atómica). */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { event_id } = await request.json();
  if (!event_id) return NextResponse.json({ error: "event_id requerido" }, { status: 400 });

  const { data, error } = await supabase.rpc("signup_for_event", { p_event_id: event_id });

  if (error) {
    if (error.message.includes("CUPO_LLENO")) {
      return NextResponse.json({ error: "Ya no hay cupos disponibles para este evento." }, { status: 409 });
    }
    if (error.code === "23505") {
      return NextResponse.json({ error: "Ya estás inscrito en este evento." }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ signup: data }, { status: 201 });
}

/** DELETE /api/signups?event_id=... — cancela la inscripción del empleado autenticado. */
export async function DELETE(request: Request) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const eventId = new URL(request.url).searchParams.get("event_id");
  if (!eventId) return NextResponse.json({ error: "event_id requerido" }, { status: 400 });

  const { error } = await supabase
    .from("event_signups")
    .delete()
    .eq("event_id", eventId)
    .eq("employee_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
