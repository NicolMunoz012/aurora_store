// =============================================================================
// @aurora/core/auth — resetPasswordUseCase (RF003)
// Valida el token y actualiza la contraseña del usuario.
// =============================================================================

import bcrypt from "bcryptjs";
import type { IAuthRepository } from "../repositories/auth.repository.interface";
import type { IVerificationTokenRepository } from "../repositories/token.repository.interface";
import { AuroraError } from "@aurora/shared";
import type { PrismaAuthRepository } from "../repositories/auth.repository";

export interface ResetPasswordParams {
  authRepository: PrismaAuthRepository;
  tokenRepository: IVerificationTokenRepository;
  token: string;
  newPassword: string;
}

export async function resetPasswordUseCase(
  params: ResetPasswordParams,
): Promise<void> {
  const { authRepository, tokenRepository, token, newPassword } = params;

  // 1. Find token
  const record = await tokenRepository.findByToken(token, "PASSWORD_RESET");
  if (!record) {
    throw new AuroraError("INVALID_TOKEN", "El enlace es inválido.");
  }

  // 2. Check expiry
  if (record.expiresAt < new Date()) {
    await tokenRepository.deleteToken(record.id);
    throw new AuroraError("TOKEN_EXPIRED", "El enlace ha expirado. Solicita uno nuevo.");
  }

  // 3. Hash new password
  const passwordHash = await bcrypt.hash(newPassword, 12);

  // 4. Update password
  await authRepository.updatePassword(record.userId, passwordHash);

  // 5. Invalidate all reset tokens
  await tokenRepository.invalidateAllByUserAndType(record.userId, "PASSWORD_RESET");
}
