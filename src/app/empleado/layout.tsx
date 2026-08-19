import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";

export default async function EmpleadoLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");
  if (profile.role === "admin") redirect("/admin");

  return (
    <div className="min-h-screen bg-valet-950">
      <header className="border-b border-white/10 bg-valet-950/95">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-8">
            <Link href="/empleado" className="text-lg font-bold text-white">
              Valet<span className="text-gold-400">Staff</span>
            </Link>
            <nav className="hidden gap-5 text-sm text-slate-300 sm:flex">
              <Link href="/empleado" className="hover:text-white">
                Eventos disponibles
              </Link>
              <Link href="/empleado/mis-eventos" className="hover:text-white">
                Mis eventos
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-slate-400 sm:inline">{profile.full_name}</span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-5 py-8">{children}</main>
    </div>
  );
}
