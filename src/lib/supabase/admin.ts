import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

/**
 * Cliente con Service Role Key: ignora RLS por completo.
 * SOLO usar dentro de Route Handlers / cron jobs en el servidor
 * (crear empleados, insertar alertas automáticas). Nunca importar
 * desde código que se ejecute en el navegador.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
