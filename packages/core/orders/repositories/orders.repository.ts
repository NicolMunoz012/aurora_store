// =============================================================================
// @aurora/core/orders — PrismaOrdersRepository
// Implementación Prisma del repositorio de pedidos (Req 1.6, 8.1–8.15, 11.3).
// Encapsula todas las operaciones de acceso a datos de pedidos,
// mapeando resultados Prisma a tipos de dominio y capturando errores Prisma
// para re-lanzarlos como AuroraError.
// =============================================================================

import type { PrismaClient } from "@aurora/database/generated/prisma/client.js";
import type {
  OrderWithItems,
  OrderSummary,
  OrderRecord,
  OrderItemRecord,
  CreateOrderData,
  AdminOrderFilters,
  OrderStatus,
  UpdateOrderExtra,
} from "@aurora/shared";
import { AuroraError } from "@aurora/shared";
import { Decimal } from "decimal.js";
import type { IOrdersRepository } from "./orders.repository.interface.js";

// ─── Helper mappers ───────────────────────────────────────────────────────────

/**
 * Mapea un registro de pedido Prisma a OrderRecord (sin items).
 */
function mapToOrderRecord(order: {
  id: string;
  userId: string | null;
  clientName: string;
  clientPhone: string;
  clientEmail: string | null;
  status: string;
  deliveryMethod: string;
  shippingDepartment: string | null;
  shippingMunicipality: string | null;
  shippingAddress: string | null;
  shippingNeighborhood: string | null;
  storePickupAddress: string | null;
  trackingNumber: string | null;
  productsTotal: unknown;
  wholesalePriceApplied: boolean;
  termsAccepted: boolean;
  stockDeducted: boolean;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): OrderRecord {
  return {
    id: order.id,
    userId: order.userId,
    clientName: order.clientName,
    clientPhone: order.clientPhone,
    clientEmail: order.clientEmail,
    status: order.status as OrderStatus,
    deliveryMethod: order.deliveryMethod as OrderRecord["deliveryMethod"],
    shippingDepartment: order.shippingDepartment,
    shippingMunicipality: order.shippingMunicipality,
    shippingAddress: order.shippingAddress,
    shippingNeighborhood: order.shippingNeighborhood,
    storePickupAddress: order.storePickupAddress,
    trackingNumber: order.trackingNumber,
    productsTotal: new Decimal(order.productsTotal!.toString()),
    wholesalePriceApplied: order.wholesalePriceApplied,
    termsAccepted: order.termsAccepted,
    stockDeducted: order.stockDeducted,
    expiresAt: order.expiresAt,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

/**
 * Mapea un item de pedido Prisma a OrderItemRecord.
 */
function mapToOrderItemRecord(item: {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPriceAtPurchase: unknown;
  createdAt: Date;
}): OrderItemRecord {
  return {
    id: item.id,
    orderId: item.orderId,
    productId: item.productId,
    productName: item.productName,
    quantity: item.quantity,
    unitPriceAtPurchase: new Decimal(item.unitPriceAtPurchase!.toString()),
    createdAt: item.createdAt,
  };
}

/**
 * Mapea un pedido Prisma con items a OrderWithItems.
 */
function mapToOrderWithItems(order: {
  id: string;
  userId: string | null;
  clientName: string;
  clientPhone: string;
  clientEmail: string | null;
  status: string;
  deliveryMethod: string;
  shippingDepartment: string | null;
  shippingMunicipality: string | null;
  shippingAddress: string | null;
  shippingNeighborhood: string | null;
  storePickupAddress: string | null;
  trackingNumber: string | null;
  productsTotal: unknown;
  wholesalePriceApplied: boolean;
  stockDeducted: boolean;
  expiresAt: Date | null;
  createdAt: Date;
  items: Array<{
    id: string;
    orderId: string;
    productId: string;
    productName: string;
    quantity: number;
    unitPriceAtPurchase: unknown;
    createdAt: Date;
  }>;
}): OrderWithItems {
  return {
    id: order.id,
    userId: order.userId,
    clientName: order.clientName,
    clientPhone: order.clientPhone,
    clientEmail: order.clientEmail,
    status: order.status as OrderStatus,
    deliveryMethod: order.deliveryMethod as OrderWithItems["deliveryMethod"],
    shippingDepartment: order.shippingDepartment,
    shippingMunicipality: order.shippingMunicipality,
    shippingAddress: order.shippingAddress,
    shippingNeighborhood: order.shippingNeighborhood,
    storePickupAddress: order.storePickupAddress,
    trackingNumber: order.trackingNumber,
    productsTotal: new Decimal(order.productsTotal!.toString()),
    wholesalePriceApplied: order.wholesalePriceApplied,
    stockDeducted: order.stockDeducted,
    expiresAt: order.expiresAt,
    createdAt: order.createdAt,
    items: order.items.map(mapToOrderItemRecord),
  };
}

/**
 * Mapea un pedido Prisma a OrderSummary (solo campos para listados).
 */
function mapToOrderSummary(order: {
  id: string;
  userId: string | null;
  clientName: string;
  clientPhone: string;
  status: string;
  deliveryMethod: string;
  productsTotal: unknown;
  wholesalePriceApplied: boolean;
  createdAt: Date;
}): OrderSummary {
  return {
    id: order.id,
    userId: order.userId,
    clientName: order.clientName,
    clientPhone: order.clientPhone,
    status: order.status as OrderStatus,
    deliveryMethod: order.deliveryMethod as OrderSummary["deliveryMethod"],
    productsTotal: new Decimal(order.productsTotal!.toString()),
    wholesalePriceApplied: order.wholesalePriceApplied,
    createdAt: order.createdAt,
  };
}

// ─── Repository Implementation ───────────────────────────────────────────────

export class PrismaOrdersRepository implements IOrdersRepository {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async createOrder(data: CreateOrderData): Promise<OrderRecord> {
    try {
      const order = await this.prisma.order.create({
        data: {
          userId: data.userId,
          clientName: data.clientName,
          clientPhone: data.clientPhone,
          clientEmail: data.clientEmail ?? null,
          deliveryMethod: data.deliveryMethod,
          shippingDepartment: data.shippingDepartment ?? null,
          shippingMunicipality: data.shippingMunicipality ?? null,
          shippingAddress: data.shippingAddress ?? null,
          shippingNeighborhood: data.shippingNeighborhood ?? null,
          storePickupAddress: data.storePickupAddress ?? null,
          productsTotal: data.productsTotal.toString(),
          wholesalePriceApplied: data.wholesalePriceApplied,
          termsAccepted: data.termsAccepted,
          expiresAt: data.expiresAt,
          items: {
            create: data.items.map((item) => ({
              productId: item.productId,
              productName: item.productName,
              quantity: item.quantity,
              unitPriceAtPurchase: item.unitPriceAtPurchase.toString(),
            })),
          },
        },
      });

      return mapToOrderRecord(order);
    } catch (error) {
      throw this.handlePrismaError(error, "createOrder");
    }
  }

  async findById(id: string): Promise<OrderWithItems | null> {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id },
        include: {
          items: true,
        },
      });

      return order ? mapToOrderWithItems(order) : null;
    } catch (error) {
      throw this.handlePrismaError(error, "findById");
    }
  }

  async listByUserId(userId: string): Promise<OrderSummary[]> {
    try {
      const orders = await this.prisma.order.findMany({
        where: { userId },
        select: {
          id: true,
          userId: true,
          clientName: true,
          clientPhone: true,
          status: true,
          deliveryMethod: true,
          productsTotal: true,
          wholesalePriceApplied: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return orders.map(mapToOrderSummary);
    } catch (error) {
      throw this.handlePrismaError(error, "listByUserId");
    }
  }

  async listAll(filters: AdminOrderFilters): Promise<OrderSummary[]> {
    try {
      const where: Record<string, unknown> = {};

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.userId) {
        where.userId = filters.userId;
      }

      if (filters.dateFrom || filters.dateTo) {
        const createdAt: Record<string, Date> = {};
        if (filters.dateFrom) createdAt.gte = filters.dateFrom;
        if (filters.dateTo) createdAt.lte = filters.dateTo;
        where.createdAt = createdAt;
      }

      const orders = await this.prisma.order.findMany({
        where,
        select: {
          id: true,
          userId: true,
          clientName: true,
          clientPhone: true,
          status: true,
          deliveryMethod: true,
          productsTotal: true,
          wholesalePriceApplied: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return orders.map(mapToOrderSummary);
    } catch (error) {
      throw this.handlePrismaError(error, "listAll");
    }
  }

  async updateStatus(
    id: string,
    status: OrderStatus,
    extra?: UpdateOrderExtra,
  ): Promise<OrderRecord> {
    try {
      const data: Record<string, unknown> = { status };

      if (extra?.trackingNumber !== undefined) {
        data.trackingNumber = extra.trackingNumber;
      }

      if (extra?.stockDeducted !== undefined) {
        data.stockDeducted = extra.stockDeducted;
      }

      const order = await this.prisma.order.update({
        where: { id },
        data,
      });

      return mapToOrderRecord(order);
    } catch (error) {
      throw this.handlePrismaError(error, "updateStatus");
    }
  }

  async findExpiredPendingOrders(now: Date): Promise<OrderRecord[]> {
    try {
      const orders = await this.prisma.order.findMany({
        where: {
          status: "PENDING_CONFIRMATION",
          expiresAt: { lt: now },
        },
      });

      return orders.map(mapToOrderRecord);
    } catch (error) {
      throw this.handlePrismaError(error, "findExpiredPendingOrders");
    }
  }

  async markStockDeducted(orderId: string): Promise<void> {
    try {
      await this.prisma.order.update({
        where: { id: orderId },
        data: { stockDeducted: true },
      });
    } catch (error) {
      throw this.handlePrismaError(error, "markStockDeducted");
    }
  }

  /**
   * Captura errores de Prisma y los transforma en AuroraError.
   * Nunca se exponen errores crudos de Prisma fuera de la capa de repositorio (Req 11.3).
   */
  private handlePrismaError(error: unknown, operation: string): AuroraError {
    if (error instanceof AuroraError) {
      return error;
    }

    if (
      error instanceof Error &&
      "code" in error &&
      typeof (error as Record<string, unknown>).code === "string"
    ) {
      const prismaCode = (error as Record<string, unknown>).code as string;

      if (prismaCode === "P2002") {
        return new AuroraError(
          "REPOSITORY_ERROR",
          `Unique constraint violation in ${operation}`,
        );
      }

      if (prismaCode === "P2025") {
        return new AuroraError(
          "REPOSITORY_ERROR",
          `Record not found in ${operation}`,
        );
      }

      return new AuroraError(
        "REPOSITORY_ERROR",
        `Database error [${prismaCode}] in ${operation}`,
      );
    }

    return new AuroraError(
      "REPOSITORY_ERROR",
      `Unexpected error in ${operation}: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
