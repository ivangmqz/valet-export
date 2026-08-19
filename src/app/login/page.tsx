"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-valet-950 px-5">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 block text-center text-lg font-bold text-white">
          Valet<span className="text-gold-400">Premium</span>
        </Link>
        <div className="card">
          <h1 className="text-xl font-semibold text-white">Acceso Staff</h1>
          <p className="mt-1 text-sm text-slate-400">
            Solo para administradores y empleados registrados.
          </p>

          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
        <p className="mt-6 text-center text-xs text-slate-500">
          Las cuentas de empleado son creadas únicamente por el administrador.
        </p>
      </div>
    </main>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError || !data.user) {
        setError("Correo o contraseña incorrectos.");
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, active")
        .eq("id", data.user.id)
        .single();

      if (!profile || !profile.active) {
        setError("Tu cuenta no está activa. Contacta al administrador.");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      const next = searchParams.get("next");
      const destination = next ?? (profile.role === "admin" ? "/admin" : "/empleado");
      router.push(destination);
      router.refresh();
    } catch {
      setError("No se pudo conectar con el servidor. Intenta de nuevo.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div>
        <label className="label" htmlFor="email">
          Correo
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label className="label" htmlFor="password">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
        {loading ? "Ingresando..." : "Ingresar"}
      </button>
    </form>
  );
}
