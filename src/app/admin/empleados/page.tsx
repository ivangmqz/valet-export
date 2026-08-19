import { createClient } from "@/lib/supabase/server";
import EmployeesList from "@/components/admin/EmployeesList";
import type { Profile } from "@/types/database.types";

export const dynamic = "force-dynamic";

export default async function AdminEmployeesPage() {
  const supabase = await createClient();
  const { data: employees } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "empleado")
    .order("full_name", { ascending: true });

  return <EmployeesList employees={(employees ?? []) as Profile[]} />;
}
