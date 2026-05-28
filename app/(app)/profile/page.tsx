import { cookies } from 'next/headers';
import { verifyUserJwt } from '@/lib/auth';
import ChangePasswordForm from '@/components/ChangePasswordForm';

export const dynamic = 'force-dynamic';

const ROLE_LABEL: Record<string, string> = { admin: 'Propietaria', conductor: 'Conductor', socio: 'Socio' };

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('buseta_session')?.value;
  const user = token ? await verifyUserJwt(token).catch(() => null) : null;

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <div className="mb-5">
        <p className="eyebrow">Perfil</p>
        <h1 className="font-display text-3xl font-extrabold text-ink">Tu cuenta</h1>
      </div>

      {user ? (
        <div className="space-y-5">
          <section className="reveal ticket overflow-hidden" style={{ ['--i' as string]: 0 }}>
            <div className="ticket-band" />
            <div className="grid grid-cols-2 divide-x divide-line p-5 text-center">
              <div>
                <p className="eyebrow">Correo</p>
                <p className="mt-1 break-all text-sm font-medium text-ink">{user.email}</p>
              </div>
              <div>
                <p className="eyebrow">Rol</p>
                <p className="mt-1 text-sm font-medium text-ink">{ROLE_LABEL[user.role] ?? user.role}</p>
              </div>
            </div>
          </section>

          {user.mustChangePassword ? (
            <div className="reveal rounded-2xl border border-warn/30 bg-warn-tint px-4 py-3 text-sm text-warn" style={{ ['--i' as string]: 1 }}>
              <b>Cambio de contraseña requerido.</b> Debes cambiarla antes de continuar.
            </div>
          ) : null}

          <section className="reveal ticket p-6" style={{ ['--i' as string]: 2 }}>
            <h2 className="font-display mb-4 text-xl font-bold text-ink">Cambiar contraseña</h2>
            <ChangePasswordForm />
          </section>
        </div>
      ) : (
        <section className="ticket p-6 text-sm text-ink-soft">No hay sesión activa. Inicia sesión de nuevo.</section>
      )}
    </main>
  );
}
