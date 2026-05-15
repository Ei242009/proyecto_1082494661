'use client';

import { useState } from 'react';

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setStatus('error');
      setMessage('Las contraseñas nuevas no coinciden');
      return;
    }

    if (newPassword.length < 8) {
      setStatus('error');
      setMessage('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al cambiar contraseña');
      }

      setStatus('success');
      setMessage('Contraseña cambiada exitosamente');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Redirect after successful password change
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  return (
    <div className="rounded-3xl border border-stone-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-stone-900 mb-4">Cambiar contraseña</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-stone-700 mb-1">
            Contraseña actual
          </label>
          <input
            id="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="w-full border border-stone-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-stone-700 mb-1">
            Nueva contraseña
          </label>
          <input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
            className="w-full border border-stone-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-stone-700 mb-1">
            Confirmar nueva contraseña
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            className="w-full border border-stone-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full bg-amber-500 text-stone-950 px-4 py-2 rounded-md hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {status === 'loading' ? 'Cambiando...' : 'Cambiar contraseña'}
        </button>
      </form>

      {message && (
        <p className={`mt-4 text-sm ${status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}
    </div>
  );
}