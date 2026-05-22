/**
 * components/BusetaLogo.tsx
 * Logo SVG estilizado de buseta para la identidad visual
 */

export function BusetaLogo({ size = 80 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size * 0.75}
      viewBox="0 0 80 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto"
    >
      {/* Cuerpo de la buseta - forma principal */}
      <rect x="5" y="20" width="70" height="25" rx="3" fill="#F59E0B" stroke="#78350F" strokeWidth="1.5" />

      {/* Cabina (frente de la buseta) */}
      <rect x="5" y="15" width="15" height="15" rx="2" fill="#F59E0B" stroke="#78350F" strokeWidth="1.5" />

      {/* Ventanas del cuerpo */}
      <circle cx="22" cy="28" r="4" fill="white" opacity="0.8" />
      <circle cx="35" cy="28" r="4" fill="white" opacity="0.8" />
      <circle cx="48" cy="28" r="4" fill="white" opacity="0.8" />
      <circle cx="61" cy="28" r="4" fill="white" opacity="0.8" />

      {/* Ruedas */}
      <circle cx="15" cy="48" r="4.5" fill="#78350F" stroke="#F59E0B" strokeWidth="1" />
      <circle cx="65" cy="48" r="4.5" fill="#78350F" stroke="#F59E0B" strokeWidth="1" />

      {/* Línea de horizonte / base */}
      <line x1="5" y1="52" x2="75" y2="52" stroke="#78350F" strokeWidth="1" opacity="0.5" />

      {/* Detalles - faro */}
      <circle cx="8" cy="22" r="2" fill="white" opacity="0.7" />
    </svg>
  );
}
