/**
 * components/LoginForm.tsx
 * Formulario de login con identidad visual ámbar
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BusetaLogo } from './BusetaLogo';

interface LoginFormProps {
  onSuccess?: (role: string) => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Error en login');
      }

      const data = await response.json();
      setSuccess(true);

      // Callback opcional
      if (onSuccess) {
        onSuccess(data.role);
      }

      // Redirect a dashboard después de 1s
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md mx-auto px-4"
    >
      {/* Card con borde ámbar superior */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border-t-4 border-amber-400">
        <div className="p-8">
          {/* Logo */}
          <div className="mb-6">
            <BusetaLogo size={100} />
          </div>

          {/* Título */}
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
            BusetaApp
          </h1>
          <p className="text-center text-gray-500 text-sm mb-6">
            Gestión financiera para conductores
          </p>

          {/* Mensaje de éxito */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
              ✓ Autenticación exitosa. Redirigiendo...
            </div>
          )}

          {/* Mensaje de error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Email Input */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              required
              disabled={loading || success}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>

          {/* Password Input */}
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading || success}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-2 px-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Ingresando...
              </>
            ) : success ? (
              <>
                <span className="mr-2">✓</span> Éxito
              </>
            ) : (
              'Ingresar'
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
          <p className="text-center text-xs text-gray-500">
            © 2026 BusetaApp — Gestión Financiera para Conductores
          </p>
        </div>
      </div>

      {/* Demo info - solo en seed */}
      {process.env.NEXT_PUBLIC_MODE === 'seed' && (
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
          <p className="font-semibold mb-2">🧪 Datos de prueba (Modo Seed):</p>
          <ul className="space-y-1">
            <li><strong>Admin:</strong> admin@busetaapp.co / admin123456</li>
            <li><strong>Conductor:</strong> juan@conductor.co / admin123456</li>
            <li><strong>Socio:</strong> propietaria@busetas.co / admin123456</li>
          </ul>
        </div>
      )}
    </form>
  );
}
