"use server";
// =============================================================================
// apps/web/lib/actions/auth.actions.ts
// Server Actions para autenticación: registro, recuperación de contraseña.
// =============================================================================

import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { handleActionError } from "@/lib/action-error";
import type { ActionResult } from "@/lib/types";
import { signIn } from "@/lib/auth";
import { mergeCartsAction } from "@/lib/actions/cart.actions";
import {
  registerClientUseCase,
  requestPasswordResetUseCase,
  resetPasswordUseCase,
  PrismaAuthRepository,
  PrismaVerificationTokenRepository,
} from "@aurora/core/auth";
import { sendPasswordResetEmail } from "@/lib/email";

// ─── Validation helpers ───────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/;

function validateRegistrationInput(params: {
  name: string;
  email: string;
  password: string;
  termsAccepted: boolean;
}): { code: string; message: string } | null {
  const name = params.name.trim();
  const email = params.email.trim();
  const password = params.password;

  if (!name || name.length < 2) {
    return { code: "INVALID_NAME", message: "El nombre debe tener al menos 2 caracteres." };
  }
  if (name.length > 100) {
    return { code: "INVALID_NAME", message: "El nombre no puede superar 100 caracteres." };
  }
  if (!NAME_REGEX.test(name)) {
    return { code: "INVALID_NAME", message: "El nombre solo puede contener letras y espacios." };
  }

  if (!email) {
    return { code: "INVALID_EMAIL", message: "El correo electrónico es obligatorio." };
  }
  if (/\s/.test(email)) {
    return { code: "INVALID_EMAIL", message: "El correo no puede contener espacios." };
  }
  if (!EMAIL_REGEX.test(email)) {
    return { code: "INVALID_EMAIL", message: "El formato del correo electrónico no es válido." };
  }

  if (!password || password.length < 8) {
    return { code: "INVALID_PASSWORD", message: "La contraseña debe tener al menos 8 caracteres." };
  }
  if (/\s/.test(password)) {
    return { code: "INVALID_PASSWORD", message: "La contraseña no puede contener espacios." };
  }
  if (password.length > 128) {
    return { code: "INVALID_PASSWORD", message: "La contraseña no puede superar 128 caracteres." };
  }
  if (!/[A-Z]/.test(password)) {
    return { code: "INVALID_PASSWORD", message: "La contraseña debe incluir al menos una mayúscula." };
  }
  if (!/[a-z]/.test(password)) {
    return { code: "INVALID_PASSWORD", message: "La contraseña debe incluir al menos una minúscula." };
  }
  if (!/[0-9]/.test(password)) {
    return { code: "INVALID_PASSWORD", message: "La contraseña debe incluir al menos un número." };
  }

  if (!params.termsAccepted) {
    return { code: "TERMS_NOT_ACCEPTED", message: "Debes aceptar los términos y condiciones para registrarte." };
  }

  return null;
}

// ─── Register ─────────────────────────────────────────────────────────────────

export async function registerAction(params: {
  name: string;
  email: string;
  password: string;
  termsAccepted: boolean;
}): Promise<ActionResult<{ userId: string }>> {
  try {
    // 1. Server-side validation
    const validationError = validateRegistrationInput(params);
    if (validationError) {
      return { data: null, error: validationError };
    }

    // 2. Register via use case (hashes password, validates email uniqueness)
    const repository = new PrismaAuthRepository(prisma);
    const user = await registerClientUseCase({
      repository,
      email: params.email.trim().toLowerCase(),
      fullName: params.name.trim(),
      password: params.password,
      termsAccepted: true,
    });

    // 3. Auto-login after successful registration
    await signIn("credentials", {
      email: params.email.trim().toLowerCase(),
      password: params.password,
      redirect: false,
    });

    // 4. Merge anonymous cart if sessionId cookie is present
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("aurora_session_id")?.value;
    if (sessionId) {
      await mergeCartsAction({ sessionId, userId: user.id });
    }

    return { data: { userId: user.id }, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

// ─── Password Reset Request ───────────────────────────────────────────────────

export async function requestPasswordResetAction(
  email: string,
): Promise<ActionResult<{ message: string }>> {
  // Validate email format first
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    return { data: null, error: { code: "INVALID_EMAIL", message: "Ingresa un correo electrónico válido." } };
  }

  try {
    const authRepository = new PrismaAuthRepository(prisma);
    const tokenRepository = new PrismaVerificationTokenRepository(prisma);
    const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

    await requestPasswordResetUseCase({
      authRepository,
      tokenRepository,
      sendEmail: sendPasswordResetEmail,
      email: email.trim().toLowerCase(),
      resetBaseUrl: baseUrl,
    });

    // Always same message — anti-enumeration (Req 2.2)
    return {
      data: { message: "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña." },
      error: null,
    };
  } catch {
    // Still return success message even on error — anti-enumeration
    return {
      data: { message: "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña." },
      error: null,
    };
  }
}

// ─── Password Reset ───────────────────────────────────────────────────────────

export async function resetPasswordAction(params: {
  token: string;
  newPassword: string;
}): Promise<ActionResult<void>> {
  try {
    if (!params.newPassword || params.newPassword.length < 8) {
      return { data: null, error: { code: "INVALID_PASSWORD", message: "La contraseña debe tener al menos 8 caracteres." } };
    }

    const authRepository = new PrismaAuthRepository(prisma);
    const tokenRepository = new PrismaVerificationTokenRepository(prisma);

    await resetPasswordUseCase({
      authRepository,
      tokenRepository,
      token: params.token,
      newPassword: params.newPassword,
    });

    return { data: undefined, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}
