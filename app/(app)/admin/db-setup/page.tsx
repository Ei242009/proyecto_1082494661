'use client';

import { useState } from 'react';

export default function DbSetupPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleBootstrap() {
    setStatus('loading');
    setMessage('');

    const response = await fetch('/api/admin/db-setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: '' }),
    });

    const data = await response.json();
    if (!response.ok) {
      setStatus('error');
      setMessage(data.error || 'Error al ejecutar el bootstrap.');
      return;
    }

    setStatus('success');
    setMessage(data.message);
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <div className="rounded-[20px] border border-stone-200 bg-white p-5 shadow-sm">
        <p className="text-sm uppercase tracking-[0.2em] text-stone-500">Bootstrap</p>
        <h1 className="mt-3 text-2xl font-semibold text-stone-900">DB Setup</h1>
        <div className="mt-5 rounded-[20px] border border-amber-100 bg-amber-50 p-4 text-sm text-amber-900">
          <p>Aplicará 4 migrations y cargará:</p>
          <ul className="mt-3 space-y-2 list-disc pl-5 text-stone-700">
            <li>1 usuario admin</li>
            <li>Configuración inicial: tarifa $80.000</li>
            <li>Límite de gasto: $200.000</li>
          </ul>
        </div>

        <button
          onClick={handleBootstrap}
          disabled={status === 'loading'}
          className="mt-6 min-h-[48px] w-full rounded-3xl bg-amber-600 px-4 text-base font-semibold text-white shadow-sm transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {status === 'loading' ? 'Ejecutando...' : 'Ejecutar bootstrap'}
        </button>

        {message ? (
          <p className={`mt-4 rounded-3xl border px-4 py-3 text-sm ${status === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
            {message}
          </p>
        ) : null}
      </div>
    </main>
  );
}
