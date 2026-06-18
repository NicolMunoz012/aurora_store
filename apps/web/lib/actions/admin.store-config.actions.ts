"use server";
// =============================================================================
// apps/web/lib/actions/admin.store-config.actions.ts (Req 3.5, 20.1–20.3)
// =============================================================================

import { prisma } from "@/lib/db";
import { handleActionError } from "@/lib/action-error";
import type { ActionResult } from "@/lib/types";
import { Decimal } from "decimal.js";
import { auth } from "@/lib/auth";
import {
  getStoreConfigUseCase,
  updateStoreConfigUseCase,
  PrismaStoreConfigRepository,
} from "@aurora/core/store-config";
import { verifyUserRoleUseCase, PrismaAuthRepository } from "@aurora/core/auth";
import { PrismaAuditRepository } from "@aurora/core/audit";

// Serialized config to pass to Client Components
export interface SerializedStoreConfig {
  id: string;
  wholesaleThreshold: string; // Decimal → string
  whatsappNumber: string;
  storePhysicalAddress: string;
  anonOrderExpiryDays: number;
  registeredOrderExpiryDays: number;
}

async function assertAdmin(): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw Object.assign(new Error("Unauthorized"), { code: "UNAUTHORIZED_ROLE" });
  const authRepo = new PrismaAuthRepository(prisma);
  const isAdmin = await verifyUserRoleUseCase({ repository: authRepo, userId: session.user.id, expectedRole: "ADMIN" });
  if (!isAdmin) throw Object.assign(new Error("Forbidden"), { code: "UNAUTHORIZED_ROLE" });
}

export async function getStoreConfigAdminAction(): Promise<ActionResult<SerializedStoreConfig>> {
  try {
    await assertAdmin();
    const repository = new PrismaStoreConfigRepository(prisma);
    const config = await getStoreConfigUseCase({ repository });
    return {
      data: {
        id: config.id,
        wholesaleThreshold: config.wholesaleThreshold.toString(),
        whatsappNumber: config.whatsappNumber,
        storePhysicalAddress: config.storePhysicalAddress,
        anonOrderExpiryDays: config.anonOrderExpiryDays,
        registeredOrderExpiryDays: config.registeredOrderExpiryDays,
      },
      error: null,
    };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateStoreConfigAction(data: {
  wholesaleThreshold?: string;
  whatsappNumber?: string;
  storePhysicalAddress?: string;
  anonOrderExpiryDays?: number;
  registeredOrderExpiryDays?: number;
}): Promise<ActionResult<SerializedStoreConfig>> {
  try {
    await assertAdmin();

    // Validate wholesaleThreshold is a valid positive number (Req 20.2)
    let wholesaleDecimal: Decimal | undefined;
    if (data.wholesaleThreshold !== undefined) {
      const parsed = parseFloat(data.wholesaleThreshold);
      if (isNaN(parsed) || parsed <= 0) {
        return {
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: "El umbral mayorista debe ser un número positivo.",
          },
        };
      }
      wholesaleDecimal = new Decimal(data.wholesaleThreshold);
    }

    const repository = new PrismaStoreConfigRepository(prisma);
    const auditRepo = new PrismaAuditRepository(prisma);
    const auditLogger = { log: auditRepo.log.bind(auditRepo) };

    const updated = await updateStoreConfigUseCase({
      repository,
      auditLogger,
      data: {
        wholesaleThreshold: wholesaleDecimal,
        whatsappNumber: data.whatsappNumber,
        storePhysicalAddress: data.storePhysicalAddress,
        anonOrderExpiryDays: data.anonOrderExpiryDays,
        registeredOrderExpiryDays: data.registeredOrderExpiryDays,
      },
    });

    return {
      data: {
        id: updated.id,
        wholesaleThreshold: updated.wholesaleThreshold.toString(),
        whatsappNumber: updated.whatsappNumber,
        storePhysicalAddress: updated.storePhysicalAddress,
        anonOrderExpiryDays: updated.anonOrderExpiryDays,
        registeredOrderExpiryDays: updated.registeredOrderExpiryDays,
      },
      error: null,
    };
  } catch (error) {
    return handleActionError(error);
  }
}
