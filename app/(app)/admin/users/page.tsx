'use client';

import { useState, useEffect } from 'react';
import { User, CreateUserRequest, CreateUserResponse } from '@/lib/types';

const ROLE_LABEL: Record<string, string> = { admin: 'Propietaria', conductor: 'Conductor', socio: 'Socio' };

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [form, setForm] = useState<CreateUserRequest>({ email: '', name: '', role: 'conductor' });

  useEffect(() => { void fetchUsers(); }, []);

  async function fetchUsers() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/users', { cache: 'no-store' });
      if (!res.ok) throw new Error('No se pudieron cargar los usuarios');
      setUsers(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'No se pudo crear el usuario');
      }
      const result: CreateUserResponse = await res.json();
      setTempPassword(result.temp_password);
      setForm({ email: '', name: '', role: 'conductor' });
      void fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  }

  async function toggleStatus(id: string, current: boolean) {
    try {
      const res = await fetch(`/api/users/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !current }),
      });
      if (!res.ok) throw new Error('No se pudo actualizar el estado');
      void fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:max-w-5xl">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Administración</p>
          <h1 className="font-display text-3xl font-extrabold text-ink">Usuarios</h1>
        </div>
        <button onClick={() => { setShowCreate(true); setTempPassword(null); }} className="btn btn-primary">+ Crear</button>
      </div>

      {error ? <div className="mb-4 rounded-xl border border-neg/30 bg-neg-tint px-4 py-3 text-sm text-neg">{error}</div> : null}

      {loading ? (
        <div className="ticket p-6 text-sm text-ink-faint">Cargando usuarios…</div>
      ) : users.length === 0 ? (
        <div className="ticket p-6 text-center text-sm text-ink-soft">No hay usuarios creados todavía.</div>
      ) : (
        <div className="space-y-3">
          {users.map((u, i) => (
            <article key={u.id} className="reveal ticket flex items-center justify-between gap-4 p-4" style={{ ['--i' as string]: i }}>
              <div className="min-w-0">
                <p className="font-medium text-ink">{u.name}</p>
                <p className="truncate font-mono text-xs text-ink-faint">{u.email}</p>
                <span className="badge badge-closed mt-1">{ROLE_LABEL[u.role] ?? u.role}</span>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`badge ${u.is_active ? 'badge-pos' : 'badge-neg'}`}>{u.is_active ? 'Activo' : 'Inactivo'}</span>
                <button
                  onClick={() => toggleStatus(u.id, u.is_active)}
                  className={`btn min-h-[36px] px-3 text-xs ${u.is_active ? 'btn-neg' : 'btn-pos'}`}
                >
                  {u.is_active ? 'Suspender' : 'Activar'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {showCreate ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/50 p-4" onClick={() => { setShowCreate(false); setTempPassword(null); }}>
          <div className="ticket w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="ticket-band" />
            <div className="p-6">
              <h2 className="font-display text-xl font-bold text-ink">Crear usuario</h2>

              {tempPassword ? (
                <div className="mt-4 rounded-xl border border-warn/30 bg-warn-tint p-4">
                  <p className="text-sm font-medium text-warn">Contraseña temporal (se muestra una sola vez):</p>
                  <div className="mt-2 flex items-center gap-2">
                    <code className="money rounded-lg bg-paper px-3 py-1 text-ink">{tempPassword}</code>
                    <button onClick={() => { navigator.clipboard.writeText(tempPassword); }} className="font-mono text-xs underline text-marigold-deep">copiar</button>
                  </div>
                  <p className="mt-2 text-xs text-warn">El usuario deberá cambiarla en su primer ingreso.</p>
                </div>
              ) : null}

              <form onSubmit={handleCreate} className="mt-4 space-y-4">
                <div>
                  <label className="label">Nombre</label>
                  <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="field" />
                </div>
                <div>
                  <label className="label">Correo</label>
                  <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="field" />
                </div>
                <div>
                  <label className="label">Rol</label>
                  <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as CreateUserRequest['role'] })} className="field">
                    <option value="conductor">Conductor</option>
                    <option value="socio">Socio</option>
                    <option value="admin">Propietaria (admin)</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button type="submit" className="btn btn-primary">Crear</button>
                  <button type="button" onClick={() => { setShowCreate(false); setTempPassword(null); }} className="btn btn-ghost">Cerrar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
