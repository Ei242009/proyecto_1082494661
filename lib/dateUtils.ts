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

export function getPeriodDateRange(period: 'day' | 'week' | 'month'): { from: string; to: string } {
  const now = new Date();
  const bogotaTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Bogota' }));
  const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Bogota' }).format(bogotaTime);

  if (period === 'day') {
    return { from: today, to: today };
  }

  if (period === 'week') {
    // Monday to Sunday of current week
    const dayOfWeek = bogotaTime.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const monday = new Date(bogotaTime);
    monday.setDate(bogotaTime.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const from = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Bogota' }).format(monday);
    const to = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Bogota' }).format(sunday);
    return { from, to };
  }

  if (period === 'month') {
    const year = bogotaTime.getFullYear();
    const month = bogotaTime.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const from = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Bogota' }).format(firstDay);
    const to = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Bogota' }).format(lastDay);
    return { from, to };
  }

  throw new Error(`Invalid period: ${period}`);
}
