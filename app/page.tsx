'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

const LANDING_BY_ROLE: Record<string, string> = {
  admin: '/dashboard',
  conductor: '/turno',
  socio: '/audit',
};

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState('propietaria@busetaapp.app');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({ error: 'Error desconocido' }));
        setStatus('error');
        setMessage(payload.error ?? 'No se pudo iniciar sesión.');
        return;
      }

      const payload = await response.json();
      setStatus('success');
      setMessage('Sesión iniciada. Abordando…');
      const destination = payload.mustChangePassword ? '/profile' : LANDING_BY_ROLE[payload.role] ?? '/dashboard';
      router.push(destination);
    } catch {
      setStatus('error');
      setMessage('Error de conexión con el servidor.');
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      {/* Fondo tablero de ruta oscuro */}
      <div className="board absolute inset-0 -z-10 border-b-0" />
      <div
        className="absolute inset-0 -z-10 opacity-[0.12]"
        style={{ backgroundImage: 'repeating-linear-gradient(135deg, #E07A0F 0 2px, transparent 2px 22px)' }}
      />

      <div className="w-full max-w-sm">
        {/* Cabecera de marca */}
        <div className="reveal mb-6 text-center" style={{ ['--i' as string]: 0 }}>
          <span className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-marigold text-ink shadow-[0_0_40px_-6px_rgba(224,122,15,.7)]">
            <svg viewBox="0 0 48 32" className="h-9 w-9" fill="none" aria-hidden>
              <rect x="3" y="6" width="42" height="17" rx="4" fill="currentColor" />
              <rect x="7" y="10" width="11" height="6" rx="1.5" fill="#FCF6EA" />
              <rect x="20" y="10" width="11" height="6" rx="1.5" fill="#FCF6EA" />
              <circle cx="14" cy="26" r="3.2" fill="currentColor" />
              <circle cx="34" cy="26" r="3.2" fill="currentColor" />
              <path d="M36 10h6v6h-6z" fill="#FCF6EA" />
            </svg>
          </span>
          <p className="board-led text-[11px]">CONTROL FINANCIERO · BUSETA</p>
          <h1 className="font-display mt-1 text-4xl font-extrabold tracking-tight text-paper-2">BusetaApp</h1>
        </div>

        {/* Tiquete de acceso */}
        <div className="reveal ticket overflow-hidden" style={{ ['--i' as string]: 1 }}>
          <div className="ticket-band" />
          <div className="px-6 pt-6">
            <div className="flex items-center justify-between gap-2">
              <p className="eyebrow truncate">Tiquete de acceso</p>
              <p className="font-mono text-[10px] text-ink-faint shrink-0">N.º 1082494661</p>
            </div>
            <h2 className="font-display mt-2 text-2xl font-bold text-ink">Aborda tu jornada</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Solo cuentas creadas por la propietaria pueden ingresar.
            </p>
          </div>

          <div className="px-6 py-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="label">Correo</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="field"
                  autoComplete="email"
                />
              </div>
              <div>
                <label htmlFor="password" className="label">Contraseña</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="field"
                  autoComplete="current-password"
                  placeholder="••••••••"
                />
              </div>

              <button type="submit" disabled={status === 'loading'} className="btn btn-primary w-full">
                {status === 'loading' ? 'Verificando…' : 'Iniciar sesión'}
              </button>
            </form>

            {message ? (
              <p
                className={`mt-4 rounded-xl border px-4 py-3 text-sm font-medium ${
                  status === 'success'
                    ? 'border-pos/30 bg-pos-tint text-pos'
                    : 'border-neg/30 bg-neg-tint text-neg'
                }`}
              >
                {message}
              </p>
            ) : null}
          </div>

          <div className="tear" />
          <div className="flex items-center justify-between gap-2 px-6 py-4">
            <p className="font-mono text-[10px] uppercase tracking-wide text-ink-faint truncate">Sin registro público</p>
            <p className="font-mono text-[10px] text-ink-faint shrink-0">COP · Bogotá</p>
          </div>
        </div>
      </div>
    </main>
  );
}
