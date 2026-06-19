"use server";
// =============================================================================
// apps/web/lib/actions/admin.inventory.actions.ts (Req 3.5, 19.1, 19.3)
// =============================================================================

import { prisma } from "@/lib/db";
import { handleActionError } from "@/lib/action-error";
import type { ActionResult } from "@/lib/types";
import type { LowStockProduct } from "@aurora/shared";
import { auth } from "@/lib/auth";
import {
  getLowStockProductsUseCase,
  adjustStockUseCase,
  PrismaInventoryRepository,
} from "@aurora/core/inventory";
import { verifyUserRoleUseCase, PrismaAuthRepository } from "@aurora/core/auth";
import { PrismaAuditRepository } from "@aurora/core/audit";

async function assertAdmin(): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw Object.assign(new Error("Unauthorized"), { code: "UNAUTHORIZED_ROLE" });
  const authRepo = new PrismaAuthRepository(prisma);
  const isAdmin = await verifyUserRoleUseCase({ repository: authRepo, userId: session.user.id, expectedRole: "ADMIN" });
  if (!isAdmin) throw Object.assign(new Error("Forbidden"), { code: "UNAUTHORIZED_ROLE" });
}

export async function getLowStockProductsAction(): Promise<ActionResult<LowStockProduct[]>> {
  try {
    await assertAdmin();
    const repository = new PrismaInventoryRepository(prisma);
    const products = await getLowStockProductsUseCase({ repository });
    return { data: products, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function adjustStockAction(
  productId: string,
  newStock: number,
  note?: string,
): Promise<ActionResult<void>> {
  try {
    await assertAdmin();
    const repository = new PrismaInventoryRepository(prisma);
    const auditRepo = new PrismaAuditRepository(prisma);
    const auditLogger = { log: auditRepo.log.bind(auditRepo) };
    await adjustStockUseCase({ repository, auditLogger, productId, newStock, note });
    return { data: undefined, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}
