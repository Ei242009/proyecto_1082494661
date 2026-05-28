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
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al cambiar contraseña');
      }
      setStatus('success');
      setMessage('Contraseña cambiada exitosamente. Redirigiendo…');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => { window.location.href = '/'; }, 1600);
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="currentPassword" className="label">Contraseña actual</label>
        <input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className="field" autoComplete="current-password" />
      </div>
      <div>
        <label htmlFor="newPassword" className="label">Nueva contraseña</label>
        <input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} className="field" autoComplete="new-password" />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="label">Confirmar nueva contraseña</label>
        <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={8} className="field" autoComplete="new-password" />
      </div>

      <button type="submit" disabled={status === 'loading'} className="btn btn-primary w-full">
        {status === 'loading' ? 'Cambiando…' : 'Cambiar contraseña'}
      </button>

      {message ? (
        <p className={`rounded-xl border px-4 py-3 text-sm font-medium ${status === 'success' ? 'border-pos/30 bg-pos-tint text-pos' : 'border-neg/30 bg-neg-tint text-neg'}`}>
          {message}
        </p>
      ) : null}
    </form>
  );
}
