import type { Metadata } from 'next';
import { LoginForm } from '@/components/LoginForm';

export const metadata: Metadata = {
  title: 'BusetaApp — Login',
  description: 'Autenticación segura para gestión financiera de conductores',
};

/**
 * Home Page — Login Screen
 * Identidad visual ámbar (#78350F), tarjeta blanca, logo SVG de buseta
 * Modo seed: datos de prueba disponibles
 */
export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#78350F' }}>
      {/* Background pattern - opcional */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-amber-600" />
      </div>

      {/* Content */}
      <div className="relative w-full px-4">
        <LoginForm />
      </div>
    </div>
  );
}
