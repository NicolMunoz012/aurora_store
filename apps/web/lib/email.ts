// =============================================================================
// apps/web/lib/email.ts — Email provider using Resend
// =============================================================================

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.RESEND_FROM ?? "LunaRose <noreply@aurorabelleza.com>";

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
): Promise<void> {
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Restablece tu contraseña — LunaRose",
    html: `
      <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h1 style="font-size: 28px; color: #1a1a1a; margin-bottom: 8px;">Hola,</h1>
        <p style="color: #666; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
          Recibimos una solicitud para restablecer la contraseña de tu cuenta en LunaRose.
        </p>
        <a href="${resetUrl}"
          style="display: inline-block; background: #CD0E5E; color: white; padding: 14px 28px;
          text-decoration: none; border-radius: 2px; font-size: 13px; letter-spacing: 0.15em;
          text-transform: uppercase; font-weight: 600;">
          Restablecer contraseña
        </a>
        <p style="color: #999; font-size: 13px; margin-top: 24px; line-height: 1.6;">
          Este enlace expira en <strong>1 hora</strong>. Si no solicitaste este cambio, puedes ignorar este mensaje.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
        <p style="color: #bbb; font-size: 12px;">LunaRose · Colombia</p>
      </div>
    `,
  });
}
