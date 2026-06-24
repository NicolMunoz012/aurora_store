// =============================================================================
// @aurora/core/auth — requestPasswordResetUseCase (RF003)
// Genera un token de reset y llama al email provider.
// SIEMPRE devuelve el mismo mensaje (no revela si el email existe).
// =============================================================================

import { randomBytes } from "crypto";
import type { IAuthRepository } from "../repositories/auth.repository.interface";
import type { IVerificationTokenRepository } from "../repositories/token.repository.interface";

export interface RequestPasswordResetParams {
  authRepository: IAuthRepository;
  tokenRepository: IVerificationTokenRepository;
  /** Callback que envía el email — inyectado desde apps/web */
  sendEmail: (to: string, resetUrl: string) => Promise<void>;
  email: string;
  resetBaseUrl: string;
}

export async function requestPasswordResetUseCase(
  params: RequestPasswordResetParams,
): Promise<void> {
  const { authRepository, tokenRepository, sendEmail, email, resetBaseUrl } = params;

  // 1. Find user — if not found, return silently (anti-enumeration)
  const user = await authRepository.findUserByEmail(email);
  if (!user) return;

  // 2. Invalidate previous reset tokens
  await tokenRepository.invalidateAllByUserAndType(user.id, "PASSWORD_RESET");

  // 3. Generate secure token
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await tokenRepository.createToken({
    userId: user.id,
    token,
    type: "PASSWORD_RESET",
    expiresAt,
  });

  // 4. Send email
  const resetUrl = `${resetBaseUrl}/reset-password?token=${token}`;
  await sendEmail(email, resetUrl);
}
