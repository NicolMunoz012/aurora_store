"use server";
// =============================================================================
// apps/web/lib/actions/auth.actions.ts
// Server Actions para autenticación: registro, recuperación de contraseña (Req 1.1–1.3, 2.1, 2.2, 2.5).
// NOTA: requestPasswordResetAction y resetPasswordAction requieren
// requestPasswordResetUseCase y resetPasswordUseCase en @aurora/core/auth,
// los cuales serán implementados como parte del Bloque D / Requisito 2.
// =============================================================================

import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { handleActionError } from "@/lib/action-error";
import type { ActionResult } from "@/lib/types";
import { signIn } from "@/lib/auth";
import { mergeCartsAction } from "@/lib/actions/cart.actions";
import {
  registerClientUseCase,
  PrismaAuthRepository,
} from "@aurora/core/auth";

// ─── Register ─────────────────────────────────────────────────────────────────

export async function registerAction(params: {
  name: string;
  email: string;
  password: string;
  termsAccepted: boolean;
}): Promise<ActionResult<{ userId: string }>> {
  try {
    // 1. Validate terms acceptance (Req 1.3)
    if (!params.termsAccepted) {
      return {
        data: null,
        error: {
          code: "TERMS_NOT_ACCEPTED",
          message: "Debes aceptar los términos y condiciones para registrarte.",
        },
      };
    }

    // 2. Register via use case (hashes password, validates email uniqueness)
    const repository = new PrismaAuthRepository(prisma);
    const user = await registerClientUseCase({
      repository,
      email: params.email,
      fullName: params.name,
      password: params.password,
      termsAccepted: true,
    });

    // 3. Auto-login after successful registration (Req 1.1)
    await signIn("credentials", {
      email: params.email,
      password: params.password,
      redirect: false,
    });

    // 4. Merge anonymous cart if sessionId cookie is present (Req 7.1)
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
  _email: string,
): Promise<ActionResult<{ message: string }>> {
  // TODO: Implement once requestPasswordResetUseCase is added to @aurora/core/auth.
  // This use case requires: IVerificationTokenRepository, VerificationToken model,
  // and a transactional email provider (Resend recommended).
  // Always return the same message regardless of email existence (Req 2.2).
  return {
    data: {
      message:
        "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.",
    },
    error: null,
  };
}

// ─── Password Reset ───────────────────────────────────────────────────────────

export async function resetPasswordAction(_params: {
  token: string;
  newPassword: string;
}): Promise<ActionResult<void>> {
  // TODO: Implement once resetPasswordUseCase is added to @aurora/core/auth.
  // This use case requires: IVerificationTokenRepository + token validation logic.
  return {
    data: null,
    error: {
      code: "NOT_IMPLEMENTED",
      message:
        "El restablecimiento de contraseña no está disponible aún. Por favor contacta al administrador.",
    },
  };
}
