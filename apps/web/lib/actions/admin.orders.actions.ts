"use server";
// =============================================================================
// apps/web/lib/actions/admin.orders.actions.ts (Req 3.5, 18.1, 18.3–18.6)
// =============================================================================

import { prisma, withDbRetry } from "@/lib/db";
import { handleActionError } from "@/lib/action-error";
import { serializeOrderWithItems, serializeOrderSummary, type SerializedOrderWithItems, type SerializedOrderSummary } from "@/lib/serializers";
import type { ActionResult } from "@/lib/types";
import type { AdminOrderFilters, OrderStatus } from "@aurora/shared";
import { auth } from "@/lib/auth";
import {
  listOrdersAdminUseCase,
  updateOrderStatusUseCase,
  cancelOrderUseCase,
  PrismaOrdersRepository,
} from "@aurora/core/orders";
import { verifyUserRoleUseCase, PrismaAuthRepository } from "@aurora/core/auth";
import { PrismaAuditRepository } from "@aurora/core/audit";
import { PrismaInventoryRepository, InventoryService } from "@aurora/core/inventory";

async function assertAdmin(): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw Object.assign(new Error("Unauthorized"), { code: "UNAUTHORIZED_ROLE" });
  const authRepo = new PrismaAuthRepository(prisma);
  const isAdmin = await verifyUserRoleUseCase({ repository: authRepo, userId: session.user.id, expectedRole: "ADMIN" });
  if (!isAdmin) throw Object.assign(new Error("Forbidden"), { code: "UNAUTHORIZED_ROLE" });
}

function buildDeps() {
  const ordersRepo = new PrismaOrdersRepository(prisma);
  const inventoryRepo = new PrismaInventoryRepository(prisma);
  const auditRepo = new PrismaAuditRepository(prisma);
  const auditLogger = { log: auditRepo.log.bind(auditRepo) };
  const inventoryService = new InventoryService(
    inventoryRepo,
    auditLogger,
    async (ordId) => {
      const ord = await ordersRepo.findById(ordId);
      return ord?.items.map((i) => ({ productId: i.productId, productName: i.productName, quantity: i.quantity })) ?? [];
    },
  );
  return { ordersRepo, inventoryService, auditLogger };
}

export async function listOrdersAdminAction(
  filters: AdminOrderFilters = {},
): Promise<ActionResult<SerializedOrderSummary[]>> {
  try {
    await assertAdmin();
    const { ordersRepo } = buildDeps();
    const orders = await withDbRetry(() =>
      listOrdersAdminUseCase({ repository: ordersRepo, filters }),
    );
    return { data: orders.map(serializeOrderSummary), error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateOrderStatusAction(
  orderId: string,
  status: OrderStatus,
  trackingNumber?: string,
): Promise<ActionResult<SerializedOrderWithItems>> {
  try {
    await assertAdmin();
    const { ordersRepo, inventoryService, auditLogger } = buildDeps();
    await withDbRetry(() =>
      updateOrderStatusUseCase({
        repository: ordersRepo,
        inventoryService,
        auditLogger,
        orderId,
        newStatus: status,
        trackingNumber: trackingNumber ?? null,
      }),
    );
    // Reload order with items to return complete data
    const order = await withDbRetry(() => ordersRepo.findById(orderId));
    if (!order) throw Object.assign(new Error("Order not found"), { code: "ENTITY_NOT_FOUND" });
    return { data: serializeOrderWithItems(order), error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function cancelOrderAction(
  orderId: string,
): Promise<ActionResult<void>> {
  try {
    await assertAdmin();
    const { ordersRepo, inventoryService, auditLogger } = buildDeps();
    await withDbRetry(() =>
      cancelOrderUseCase({ repository: ordersRepo, inventoryService, auditLogger, orderId }),
    );
    return { data: undefined, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function getOrderAdminAction(
  orderId: string,
): Promise<ActionResult<SerializedOrderWithItems>> {
  try {
    await assertAdmin();
    const { ordersRepo } = buildDeps();
    const order = await withDbRetry(() => ordersRepo.findById(orderId));
    if (!order) throw Object.assign(new Error("Order not found"), { code: "ENTITY_NOT_FOUND" });
    return { data: serializeOrderWithItems(order), error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteOrderAction(
  orderId: string,
): Promise<ActionResult<void>> {
  try {
    await assertAdmin();
    const { ordersRepo } = buildDeps();
    await withDbRetry(() => ordersRepo.deleteById(orderId));
    return { data: undefined, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}
