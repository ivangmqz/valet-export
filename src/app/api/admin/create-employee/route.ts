import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/admin/create-employee
 * Crea un usuario de Auth + su fila en `profiles` con role='empleado'.
 * Solo puede ejecutarlo un administrador autenticado (verificado aquí,
 * porque la creación de usuarios de Auth requiere la Service Role Key
 * y por lo tanto NO pasa por RLS).
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { data: requesterProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (requesterProfile?.role !== "admin") {
    return NextResponse.json({ error: "Solo un administrador puede crear empleados." }, { status: 403 });
  }

  const { full_name, email, phone, password } = await request.json();
  if (!full_name || !email || !password) {
    return NextResponse.json({ error: "full_name, email y password son obligatorios" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  if (createError || !created.user) {
    return NextResponse.json({ error: createError?.message ?? "No se pudo crear el usuario" }, { status: 400 });
  }

  const { error: profileError } = await admin.from("profiles").insert({
    id: created.user.id,
    full_name,
    phone: phone || null,
    role: "empleado"
  });

  if (profileError) {
    // Revertir la creación del usuario de Auth si falla el perfil
    await admin.auth.admin.deleteUser(created.user.id);
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  return NextResponse.json({ id: created.user.id, full_name, email }, { status: 201 });
}
