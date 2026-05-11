export interface PendingExpensePayload {
  conductor: string;
  category: string;
  amount: number;
  description: string;
}

export async function sendPendingExpenseAlert(
  ownerEmail: string,
  expense: PendingExpensePayload,
): Promise<unknown> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    throw new Error('RESEND_API_KEY and RESEND_FROM_EMAIL must be configured');
  }

  const subject = `⚠️ Gasto pendiente de aprobación — ${expense.amount.toLocaleString('es-CO')} COP`;
  const html = `
    <body style="font-family: system-ui, sans-serif; color: #111827;">
      <h1 style="color: #b45309;">Gasto pendiente de aprobación</h1>
      <p>Se registró un nuevo gasto que supera el límite configurado y requiere aprobación de la propietaria:</p>
      <ul>
        <li><strong>Conductor:</strong> ${expense.conductor}</li>
        <li><strong>Categoría:</strong> ${expense.category}</li>
        <li><strong>Monto:</strong> ${expense.amount.toLocaleString('es-CO')} COP</li>
        <li><strong>Descripción:</strong> ${expense.description}</li>
      </ul>
      <p>Ingresa a BusetaApp para revisar el gasto y aprobarlo o rechazarlo.</p>
    </body>
  `;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [ownerEmail],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend request failed: ${response.status} ${errorText}`);
  }

  return await response.json();
}
