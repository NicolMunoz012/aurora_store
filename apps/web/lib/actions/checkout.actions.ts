"use server";
// =============================================================================
// apps/web/lib/actions/checkout.actions.ts
// Server Actions para el flujo de checkout (Req 12.5, 12.6, 13.1, 13.2).
// =============================================================================

import { prisma } from "@/lib/db";
import { handleActionError } from "@/lib/action-error";
import type { ActionResult } from "@/lib/types";
import type { CreateOrderData, StockValidationResult } from "@aurora/shared";
import { auth } from "@/lib/auth";
import {
  createOrderUseCase,
  generateWhatsappMessageUseCase,
  PrismaOrdersRepository,
} from "@aurora/core/orders";
import {
  validateStockUseCase,
  PrismaInventoryRepository,
  InventoryService,
} from "@aurora/core/inventory";
import {
  getStoreConfigUseCase,
  PrismaStoreConfigRepository,
} from "@aurora/core/store-config";
import {
  PrismaAuditRepository,
} from "@aurora/core/audit";
import { PrismaCartRepository } from "@aurora/core/cart";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildAuditLogger() {
  const auditRepo = new PrismaAuditRepository(prisma);
  return { log: auditRepo.log.bind(auditRepo) };
}

// ─── Validate stock (Step 2 → Step 3 transition) ─────────────────────────────

export async function validateStockAction(
  cartId: string,
): Promise<ActionResult<StockValidationResult>> {
  try {
    // Fetch cart items from DB
    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                stock: true,
              },
            },
          },
        },
      },
    });
    if (!cart) {
      return {
        data: null,
        error: { code: "CART_NOT_FOUND", message: "Carrito no encontrado." },
      };
    }

    const inventoryRepo = new PrismaInventoryRepository(prisma);
    const result = await validateStockUseCase({
      repository: inventoryRepo,
      items: cart.items.map((i: { product: { id: string }; quantity: number }) => ({
        productId: i.product.id,
        quantity: i.quantity,
      })),
    });

    return { data: result, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

// ─── Create order ─────────────────────────────────────────────────────────────

export async function createOrderAction(
  orderInput: Omit<CreateOrderData, "userId" | "expiresAt">,
): Promise<ActionResult<{ orderId: string; whatsappUrl: string }>> {
  try {
    const session = await auth();
    const userId = session?.user?.id ?? null;

    const configRepo = new PrismaStoreConfigRepository(prisma);
    const config = await getStoreConfigUseCase({ repository: configRepo });

    // Calculate expiry date based on config
    const expiryDays = userId
      ? config.registeredOrderExpiryDays
      : config.anonOrderExpiryDays;
    const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);

    const ordersRepo = new PrismaOrdersRepository(prisma);
    const inventoryRepo = new PrismaInventoryRepository(prisma);
    const cartRepo = new PrismaCartRepository(prisma);
    const auditLogger = buildAuditLogger();

    // Build cart items for stock validation
    // We need the items from the user/session cart
    const inventoryService = new InventoryService(
      inventoryRepo,
      auditLogger,
      async (ordId) => {
        const ord = await ordersRepo.findById(ordId);
        return (
          ord?.items.map((i) => ({
            productId: i.productId,
            productName: i.productName,
            quantity: i.quantity,
          })) ?? []
        );
      },
    );

    const order = await createOrderUseCase({
      repository: ordersRepo,
      inventoryService,
      auditLogger,
      clock: { now: () => new Date() },
      data: {
        ...orderInput,
        userId,
        expiresAt,
      },
      cartItems: orderInput.items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
      })),
    });

    // Generate WhatsApp URL
    const whatsappUrl = await generateWhatsappMessageUseCase({
      repository: ordersRepo,
      orderId: order.id,
      whatsappNumber: config.whatsappNumber,
    });

    return { data: { orderId: order.id, whatsappUrl }, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

// ─── Generate WhatsApp message (for order detail "Send via WhatsApp" button) ──

export async function generateWhatsappMessageAction(
  orderId: string,
): Promise<ActionResult<{ whatsappUrl: string }>> {
  try {
    const ordersRepo = new PrismaOrdersRepository(prisma);
    const configRepo = new PrismaStoreConfigRepository(prisma);
    const config = await getStoreConfigUseCase({ repository: configRepo });

    const whatsappUrl = await generateWhatsappMessageUseCase({
      repository: ordersRepo,
      orderId,
      whatsappNumber: config.whatsappNumber,
    });

    return { data: { whatsappUrl }, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}
