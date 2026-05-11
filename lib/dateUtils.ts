export function getBogotaDateString(): string {
  const date = new Date();
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Bogota' }).format(date);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
