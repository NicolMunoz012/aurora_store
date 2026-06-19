"use server";
// =============================================================================
// apps/web/lib/actions/orders.actions.ts
// Server Actions para historial de pedidos del cliente (Req 14.1, 14.5).
// =============================================================================

import { prisma } from "@/lib/db";
import { handleActionError } from "@/lib/action-error";
import {
  serializeOrderWithItems,
  serializeOrderSummary,
  type SerializedOrderWithItems,
  type SerializedOrderSummary,
} from "@/lib/serializers";
import type { ActionResult } from "@/lib/types";
import { auth } from "@/lib/auth";
import {
  listOrdersByUserUseCase,
  getOrderUseCase,
  generateWhatsappMessageUseCase,
  PrismaOrdersRepository,
} from "@aurora/core/orders";
import {
  getStoreConfigUseCase,
  PrismaStoreConfigRepository,
} from "@aurora/core/store-config";

export async function listOrdersByUserAction(): Promise<
  ActionResult<SerializedOrderSummary[]>
> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        data: null,
        error: { code: "UNAUTHORIZED", message: "Sesión requerida." },
      };
    }
    const repository = new PrismaOrdersRepository(prisma);
    const orders = await listOrdersByUserUseCase({
      repository,
      userId: session.user.id,
    });
    return { data: orders.map(serializeOrderSummary), error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function getOrderAction(
  orderId: string,
): Promise<ActionResult<SerializedOrderWithItems>> {
  try {
    const session = await auth();
    const repository = new PrismaOrdersRepository(prisma);
    const order = await getOrderUseCase({
      repository,
      orderId,
      // Pass userId so ownership is validated for authenticated users (Req 14.5)
      userId: session?.user?.id ?? null,
    });
    return { data: serializeOrderWithItems(order), error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function generateWhatsappMessageAction(
  orderId: string,
): Promise<ActionResult<{ whatsappUrl: string }>> {
  try {
    const repository = new PrismaOrdersRepository(prisma);
    const configRepository = new PrismaStoreConfigRepository(prisma);
    const config = await getStoreConfigUseCase({ repository: configRepository });

    const whatsappUrl = await generateWhatsappMessageUseCase({
      repository,
      orderId,
      whatsappNumber: config.whatsappNumber,
    });
    return { data: { whatsappUrl }, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}
