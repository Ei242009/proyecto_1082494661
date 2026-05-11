import { cookies } from 'next/headers';
import { verifyUserJwt } from '@/lib/auth';

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('buseta_session')?.value;
  const user = token ? await verifyUserJwt(token).catch(() => null) : null;

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <div className="rounded-[20px] border border-stone-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">Perfil</p>
        <h1 className="mt-3 text-2xl font-semibold text-stone-900">Datos de usuario</h1>
        {user ? (
          <div className="mt-5 space-y-4">
            <div className="rounded-3xl bg-amber-50 p-4">
              <p className="text-sm text-stone-500">Nombre</p>
              <p className="mt-1 text-lg font-semibold text-stone-900">{user.email}</p>
            </div>
            <div className="rounded-3xl bg-stone-50 p-4">
              <p className="text-sm text-stone-500">Rol</p>
              <p className="mt-1 text-lg font-semibold text-stone-900">{user.role}</p>
            </div>
          </div>
        ) : (
          <p className="mt-5 text-sm text-stone-600">No se encontró información de sesión. Inicia sesión de nuevo.</p>
        )}
      </div>
    </main>
  );
}
