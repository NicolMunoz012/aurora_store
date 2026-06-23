"use server";
// =============================================================================
// apps/web/lib/actions/admin.store-config.actions.ts
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

export interface SerializedStoreConfig {
  id: string;
  wholesaleThreshold: string;
  whatsappNumber: string;
  storePhysicalAddress: string;
  anonOrderExpiryDays: number;
  registeredOrderExpiryDays: number;
  instagramUrl: string | null;
  facebookUrl: string | null;
  tiktokUrl: string | null;
  announcementText: string | null;
}

async function assertAdmin(): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw Object.assign(new Error("Unauthorized"), { code: "UNAUTHORIZED_ROLE" });
  const authRepo = new PrismaAuthRepository(prisma);
  const isAdmin = await verifyUserRoleUseCase({ repository: authRepo, userId: session.user.id, expectedRole: "ADMIN" });
  if (!isAdmin) throw Object.assign(new Error("Forbidden"), { code: "UNAUTHORIZED_ROLE" });
}

function serialize(config: { id: string; wholesaleThreshold: { toString(): string }; whatsappNumber: string; storePhysicalAddress: string; anonOrderExpiryDays: number; registeredOrderExpiryDays: number; instagramUrl: string | null; facebookUrl: string | null; tiktokUrl: string | null; announcementText: string | null }): SerializedStoreConfig {
  return {
    id: config.id,
    wholesaleThreshold: config.wholesaleThreshold.toString(),
    whatsappNumber: config.whatsappNumber,
    storePhysicalAddress: config.storePhysicalAddress,
    anonOrderExpiryDays: config.anonOrderExpiryDays,
    registeredOrderExpiryDays: config.registeredOrderExpiryDays,
    instagramUrl: config.instagramUrl,
    facebookUrl: config.facebookUrl,
    tiktokUrl: config.tiktokUrl,
    announcementText: config.announcementText,
  };
}

export async function getStoreConfigAdminAction(): Promise<ActionResult<SerializedStoreConfig>> {
  try {
    await assertAdmin();
    const repository = new PrismaStoreConfigRepository(prisma);
    const config = await getStoreConfigUseCase({ repository });
    return { data: serialize(config), error: null };
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
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  tiktokUrl?: string | null;
  announcementText?: string | null;
}): Promise<ActionResult<SerializedStoreConfig>> {
  try {
    await assertAdmin();

    let wholesaleDecimal: Decimal | undefined;
    if (data.wholesaleThreshold !== undefined) {
      const parsed = parseFloat(data.wholesaleThreshold);
      if (isNaN(parsed) || parsed <= 0) {
        return { data: null, error: { code: "VALIDATION_ERROR", message: "El umbral mayorista debe ser un número positivo." } };
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
        instagramUrl: data.instagramUrl,
        facebookUrl: data.facebookUrl,
        tiktokUrl: data.tiktokUrl,
        announcementText: data.announcementText,
      },
    });

    return { data: serialize(updated), error: null };
  } catch (error) {
    return handleActionError(error);
  }
}
