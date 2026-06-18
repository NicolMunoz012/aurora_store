// =============================================================================
// @aurora/core/auth — registerClientUseCase
// Registra un nuevo cliente con email y contraseña (Req 1.1).
// Valida unicidad del email, hashea la contraseña con bcrypt y persiste
// el usuario con termsAccepted: true via el repositorio.
// =============================================================================

import bcrypt from "bcryptjs";
import { AuroraError } from "@aurora/shared";
import type { UserProfile } from "@aurora/shared";
import type { IAuthRepository } from "../repositories/auth.repository.interface";

/** Parámetros para registerClientUseCase */
export interface RegisterClientParams {
  /** Repositorio extendido con createUserWithCredentials */
  repository: IAuthRepository;
  /** Dirección de correo electrónico del nuevo usuario */
  email: string;
  /** Nombre completo del nuevo usuario */
  fullName: string;
  /** Contraseña en texto plano — será hasheada internamente con bcrypt */
  password: string;
  /** El caller debe pasar explícitamente true para confirmar aceptación */
  termsAccepted: true;
}

/**
 * Registra un nuevo cliente con credenciales propias.
 *
 * Flujo:
 * 1. Verifica que el email no esté registrado (lanza EmailAlreadyExistsError si existe).
 * 2. Hashea la contraseña con bcrypt (cost factor 12).
 * 3. Persiste el usuario via createUserWithCredentials con termsAccepted: true.
 *
 * @param params - Parámetros de registro con repositorio inyectado
 * @returns El perfil público del usuario recién creado
 * @throws AuroraError con code "EMAIL_ALREADY_EXISTS" si el email ya existe
 */
export async function registerClientUseCase(
  params: RegisterClientParams,
): Promise<UserProfile> {
  const { repository, email, fullName, password, termsAccepted } = params;

  // 1. Verificar unicidad del email
  const existing = await repository.findUserByEmail(email);
  if (existing) {
    throw new AuroraError("EMAIL_ALREADY_EXISTS", "El correo ya está registrado");
  }

  // 2. Hashear la contraseña (cost factor 12 según diseño)
  const passwordHash = await bcrypt.hash(password, 12);

  // 3. Persistir el usuario con termsAccepted: true
  return repository.createUserWithCredentials({
    email,
    fullName,
    passwordHash,
    termsAccepted,
  });
}
