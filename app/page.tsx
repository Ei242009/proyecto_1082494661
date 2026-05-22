'use client';

import { useState, type FormEvent } from 'react';

const busIcon = (
  <svg viewBox="0 0 64 40" className="h-12 w-12 text-amber-500" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="10" width="52" height="20" rx="4" fill="currentColor" />
    <path d="M14 10V6h4v4M46 10V6h4v4" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <circle cx="18" cy="30" r="3" fill="white" />
    <circle cx="46" cy="30" r="3" fill="white" />
    <path d="M12 18h40" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export default function Home() {
  const [email, setEmail] = useState('propietaria@busetaapp.app');
  const [password, setPassword] = useState('admin123');
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

      setStatus('success');
      setMessage('Inicio de sesión exitoso. La cookie HttpOnly se ha enviado correctamente.');
    } catch {
      setStatus('error');
      setMessage('Error de conexión con el servidor.');
    }
  }

/**
 * Home Page — Login Screen
 * Identidad visual ámbar (#78350F), tarjeta blanca, logo SVG de buseta
 * Modo seed: datos de prueba disponibles
 */
export default function Home() {
  return (
    <main className="min-h-screen bg-[#78350F] px-4 py-8 text-slate-100">
      <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-3xl flex-col justify-center">
        <section className="mb-10 flex items-center gap-4 rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur-sm sm:p-8">
          <div className="rounded-3xl bg-[#C86A22]/10 p-4 text-[#F5E0C3] shadow-inner shadow-black/10">{busIcon}</div>
          <div>
            <p className="uppercase tracking-[0.3em] text-amber-100">BusetaApp</p>
            <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">Ingreso seguro para la ruta</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-amber-100/90">
              Reemplaza el cuaderno del conductor. Usa tu celular desde la calle y protege la jornada con autenticación segura y sesión serverless.
            </p>
          </div>
        </section>

        <section className="mx-auto w-full max-w-md rounded-[2rem] bg-white px-8 py-10 shadow-[0_25px_80px_rgba(0,0,0,0.12)]">
          <div className="mb-8 border-t-4 border-amber-500 pt-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">Login</p>
            <h2 className="mt-4 text-2xl font-semibold text-slate-900">Accede a tu cuenta</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Solo usuarios creados por la propietaria pueden ingresar. No hay registro público.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="inline-flex w-full justify-center rounded-3xl bg-amber-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {status === 'loading' ? 'Verificando...' : 'Iniciar sesión'}
            </button>
          </form>

          {message ? (
            <p className={`mt-5 rounded-3xl border px-4 py-3 text-sm ${status === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
              {message}
            </p>
          ) : null}
        </section>
      </div>
    </main>
  );
}
