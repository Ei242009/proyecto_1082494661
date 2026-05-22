/**
 * lib/emailService.ts — Envío de emails con Resend
 * Solo sendPendingExpenseAlert en Fase 1
 */

import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@busetaapp.co';

const resend = new Resend(RESEND_API_KEY);

interface SendAlertParams {
  ownerEmail: string;
  conductorName: string;
  categoria: string;
  monto: number;
  descripcion: string;
}

/**
 * Envía email de alerta de gasto pendiente a la propietaria
 * Se llama automáticamente cuando un gasto supera el límite
 */
export async function sendPendingExpenseAlert(
  params: SendAlertParams
): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  const { ownerEmail, conductorName, categoria, monto, descripcion } = params;

  const asunto = `⚠️ Gasto pendiente de aprobación — $${monto.toLocaleString('es-CO')} COP`;

  const bodyText = `
Propietaria,

Se registró un gasto que requiere tu aprobación inmediata:

Conductor: ${conductorName}
Categoría: ${categoria}
Monto: $${monto.toLocaleString('es-CO')} COP
Descripción: ${descripcion}

Este gasto superó el límite configurado de gastos. Por favor revisa en el panel de propietaria.

Gracias,
Sistema BusetaApp
  `.trim();

  const bodyHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; color: #333; background-color: #f5f5f5; margin: 0; padding: 20px; }
    .container { background-color: white; border-left: 4px solid #F59E0B; padding: 20px; border-radius: 4px; max-width: 600px; margin: 0 auto; }
    .header { color: #78350F; font-size: 18px; font-weight: bold; margin-bottom: 20px; }
    .alert-icon { display: inline-block; font-size: 24px; margin-right: 10px; }
    .details { background-color: #f9f5f0; padding: 15px; border-radius: 4px; margin: 15px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e0e0e0; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { font-weight: bold; color: #6B7280; }
    .detail-value { color: #1F2937; }
    .monto-alert { font-size: 20px; font-weight: bold; color: #DC2626; }
    .footer { font-size: 12px; color: #9CA3AF; margin-top: 20px; padding-top: 15px; border-top: 1px solid #e0e0e0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="alert-icon">⚠️</span> Gasto Pendiente de Aprobación
    </div>
    
    <p>Propietaria,</p>
    <p>Se registró un gasto que requiere tu aprobación inmediata:</p>
    
    <div class="details">
      <div class="detail-row">
        <span class="detail-label">Conductor:</span>
        <span class="detail-value">${conductorName}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Categoría:</span>
        <span class="detail-value">${categoria}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Monto:</span>
        <span class="detail-value monto-alert">$${monto.toLocaleString('es-CO')} COP</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Descripción:</span>
        <span class="detail-value">${descripcion}</span>
      </div>
    </div>
    
    <p><strong>⚡ Este gasto superó el límite configurado.</strong> Por favor revisa en el panel de propietaria y aprueba o rechaza.</p>
    
    <div class="footer">
      <p>© 2026 BusetaApp — Gestión Financiera para Conductores</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  try {
    // Validar que Resend está configurado
    if (!RESEND_API_KEY) {
      console.warn('[emailService] RESEND_API_KEY no configurada en .env.local');
      return {
        success: false,
        error: 'RESEND_API_KEY no configurada',
      };
    }

    console.log('[emailService] Enviando alerta a:', ownerEmail);

    const response = await resend.emails.send({
      from: RESEND_FROM_EMAIL,
      to: ownerEmail,
      subject: asunto,
      html: bodyHtml,
      text: bodyText,
    });

    if (response.error) {
      console.error('[emailService] Error de Resend:', response.error);
      return {
        success: false,
        error: response.error.message,
      };
    }

    console.log('[emailService] Email enviado exitosamente:', response.data?.id);
    return {
      success: true,
      messageId: response.data?.id,
    };
  } catch (error) {
    console.error('[emailService] Exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

/**
 * Función auxiliar para enviar un email de prueba
 * Uso en desarrollo: testear que Resend está configurado
 */
export async function sendTestEmail(to: string): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  try {
    if (!RESEND_API_KEY) {
      return {
        success: false,
        error: 'RESEND_API_KEY no configurada',
      };
    }

    const response = await resend.emails.send({
      from: RESEND_FROM_EMAIL,
      to,
      subject: '🧪 Email de Prueba — BusetaApp',
      html: `
        <h2>Hola 👋</h2>
        <p>Este es un email de prueba de BusetaApp.</p>
        <p>Si recibes esto, la configuración de Resend funciona correctamente.</p>
      `,
    });

    if (response.error) {
      return {
        success: false,
        error: response.error.message,
      };
    }

    return {
      success: true,
      messageId: response.data?.id,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
