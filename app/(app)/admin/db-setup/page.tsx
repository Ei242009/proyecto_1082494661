'use client';

import { useState } from 'react';

export default function DbSetupPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [log, setLog] = useState<string[]>([]);

  async function handleBootstrap() {
    setStatus('loading');
    setMessage('');
    setLog([]);
    try {
      const res = await fetch('/api/admin/db-setup', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
      const data = await res.json();
      if (!res.ok) {
        setStatus('error');
        setMessage(data.error || 'Error al ejecutar el bootstrap.');
        return;
      }
      setStatus('success');
      setLog(data.log ?? []);
      setMessage('Bootstrap completado.');
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Error de conexión.');
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <div className="mb-5">
        <p className="eyebrow">Sistema</p>
        <h1 className="font-display text-3xl font-extrabold text-ink">Bootstrap de base de datos</h1>
      </div>

      <section className="reveal ticket overflow-hidden">
        <div className="ticket-band ticket-band-ink" />
        <div className="p-6">
          <p className="text-sm text-ink-soft">
            Aplica las migraciones (users, daily_config, shifts, expenses, audit_log) en Supabase y siembra
            el admin + configuración por defecto. Es idempotente: puedes ejecutarlo varias veces sin riesgo.
          </p>
          <button onClick={handleBootstrap} disabled={status === 'loading'} className="btn btn-primary mt-5 w-full">
            {status === 'loading' ? 'Ejecutando…' : 'Ejecutar bootstrap'}
          </button>

          {message ? (
            <p className={`mt-4 rounded-xl border px-4 py-3 text-sm font-medium ${status === 'success' ? 'border-pos/30 bg-pos-tint text-pos' : 'border-neg/30 bg-neg-tint text-neg'}`}>
              {message}
            </p>
          ) : null}

          {log.length > 0 ? (
            <pre className="mt-4 overflow-x-auto rounded-xl bg-ink p-4 font-mono text-[12px] leading-relaxed text-paper-2">
              {log.join('\n')}
            </pre>
          ) : null}
        </div>
      </section>
    </main>
  );
}
