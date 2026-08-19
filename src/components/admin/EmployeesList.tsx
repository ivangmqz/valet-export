"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";
import type { Profile } from "@/types/database.types";

export default function EmployeesList({ employees }: { employees: Profile[] }) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/create-employee", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "No se pudo crear el empleado.");
      return;
    }

    setForm({ full_name: "", email: "", phone: "", password: "" });
    setShowCreate(false);
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Empleados</h1>
        <button onClick={() => setShowCreate(true)} className="btn-primary !px-4 !py-2 text-sm">
          + Nuevo empleado
        </button>
      </div>

      <div className="mt-6 space-y-2">
        {employees.length === 0 && <p className="text-sm text-slate-500">Aún no hay empleados registrados.</p>}
        {employees.map((emp) => (
          <div key={emp.id} className="card flex items-center justify-between">
            <div>
              <p className="font-medium text-white">{emp.full_name}</p>
              <p className="text-xs text-slate-500">{emp.phone || "Sin teléfono"}</p>
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                emp.active ? "bg-emerald-500/15 text-emerald-300" : "bg-slate-500/15 text-slate-400"
              }`}
            >
              {emp.active ? "Activo" : "Inactivo"}
            </span>
          </div>
        ))}
      </div>

      {showCreate && (
        <Modal title="Nuevo empleado" onClose={() => setShowCreate(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="label">Nombre completo</label>
              <input
                required
                className="input"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Correo (usuario de acceso)</label>
              <input
                type="email"
                required
                className="input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Teléfono (WhatsApp)</label>
              <input
                placeholder="521234567890"
                className="input"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Contraseña temporal</label>
              <input
                type="password"
                required
                minLength={8}
                className="input"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
              {loading ? "Creando..." : "Crear empleado"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
