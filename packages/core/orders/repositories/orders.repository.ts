// =============================================================================
// @aurora/core/orders — PrismaOrdersRepository
// Implementación Prisma del repositorio de pedidos (Req 1.6, 8.1–8.15, 11.3).
// Encapsula todas las operaciones de acceso a datos de pedidos,
// mapeando resultados Prisma a tipos de dominio y capturando errores Prisma
// para re-lanzarlos como AuroraError.
// =============================================================================

import type { PrismaClient } from "@aurora/database";
import { Prisma } from "@aurora/database";
import type {
  OrderWithItems,
  OrderSummary,
  OrderRecord,
  OrderItemRecord,
  CreateOrderData,
  AdminOrderFilters,
  UpdateOrderExtra,
} from "@aurora/shared";
import {
  OrderStatus,
  DeliveryMethod,
  AuroraError,
  OrderNotFoundError,
} from "@aurora/shared";
import { Decimal } from "decimal.js";
import type { IOrdersRepository } from "./orders.repository.interface";

// ─── Prisma field types ───────────────────────────────────────────────────────

/** Shape de Decimal que Prisma retorna — compatible con decimal.js vía toString() */
type PrismaDecimal = { toString(): string };

/** Shape base de un Order Prisma (campos escalares sin relaciones) */
type PrismaOrderScalars = {
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
  productsTotal: PrismaDecimal;
  wholesalePriceApplied: boolean;
  stockDeducted: boolean;
  expiresAt: Date | null;
  createdAt: Date;
};

/** Shape de un OrderItem Prisma */
type PrismaOrderItemScalars = {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPriceAtPurchase: PrismaDecimal;
  createdAt: Date;
};

// ─── Enum mapping helpers ─────────────────────────────────────────────────────

/**
 * Mapea el string que devuelve Prisma al enum de dominio OrderStatus.
 * Ambos comparten los mismos valores string, pero son tipos distintos.
 * El mapping explícito garantiza que un valor inesperado se detecte en runtime.
 */
function toDomainOrderStatus(value: string): OrderStatus {
  if (Object.values(OrderStatus).includes(value as OrderStatus)) {
    return value as OrderStatus;
  }
  throw new AuroraError(
    "UNKNOWN_ORDER_STATUS",
    `Unrecognized OrderStatus value from database: "${value}"`,
  );
}

/**
 * Mapea el string que devuelve Prisma al enum de dominio DeliveryMethod.
 */
function toDomainDeliveryMethod(value: string): DeliveryMethod {
  if (Object.values(DeliveryMethod).includes(value as DeliveryMethod)) {
    return value as DeliveryMethod;
  }
  throw new AuroraError(
    "UNKNOWN_DELIVERY_METHOD",
    `Unrecognized DeliveryMethod value from database: "${value}"`,
  );
}

// ─── Helper mappers ───────────────────────────────────────────────────────────

/**
 * Mapea un registro de pedido Prisma a OrderRecord (sin items).
 * Requiere termsAccepted y updatedAt además de los escalares base.
 */
function mapToOrderRecord(
  order: PrismaOrderScalars & { termsAccepted: boolean; updatedAt: Date },
): OrderRecord {
  return {
    id: order.id,
    userId: order.userId,
    clientName: order.clientName,
    clientPhone: order.clientPhone,
    clientEmail: order.clientEmail,
    status: toDomainOrderStatus(order.status),
    deliveryMethod: toDomainDeliveryMethod(order.deliveryMethod),
    shippingDepartment: order.shippingDepartment,
    shippingMunicipality: order.shippingMunicipality,
    shippingAddress: order.shippingAddress,
    shippingNeighborhood: order.shippingNeighborhood,
    storePickupAddress: order.storePickupAddress,
    trackingNumber: order.trackingNumber,
    productsTotal: new Decimal(order.productsTotal.toString()),
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
function mapToOrderItemRecord(item: PrismaOrderItemScalars): OrderItemRecord {
  return {
    id: item.id,
    orderId: item.orderId,
    productId: item.productId,
    productName: item.productName,
    quantity: item.quantity,
    unitPriceAtPurchase: new Decimal(item.unitPriceAtPurchase.toString()),
    createdAt: item.createdAt,
  };
}

/**
 * Mapea un pedido Prisma con items a OrderWithItems.
 * No incluye termsAccepted (no forma parte de OrderWithItems).
 */
function mapToOrderWithItems(
  order: PrismaOrderScalars & { items: PrismaOrderItemScalars[] },
): OrderWithItems {
  return {
    id: order.id,
    userId: order.userId,
    clientName: order.clientName,
    clientPhone: order.clientPhone,
    clientEmail: order.clientEmail,
    status: toDomainOrderStatus(order.status),
    deliveryMethod: toDomainDeliveryMethod(order.deliveryMethod),
    shippingDepartment: order.shippingDepartment,
    shippingMunicipality: order.shippingMunicipality,
    shippingAddress: order.shippingAddress,
    shippingNeighborhood: order.shippingNeighborhood,
    storePickupAddress: order.storePickupAddress,
    trackingNumber: order.trackingNumber,
    productsTotal: new Decimal(order.productsTotal.toString()),
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
  productsTotal: PrismaDecimal;
  wholesalePriceApplied: boolean;
  createdAt: Date;
}): OrderSummary {
  return {
    id: order.id,
    userId: order.userId,
    clientName: order.clientName,
    clientPhone: order.clientPhone,
    status: toDomainOrderStatus(order.status),
    deliveryMethod: toDomainDeliveryMethod(order.deliveryMethod),
    productsTotal: new Decimal(order.productsTotal.toString()),
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
      const where: Prisma.OrderWhereInput = {};

      if (filters.status !== undefined) {
        where.status = filters.status;
      }

      if (filters.userId !== undefined) {
        where.userId = filters.userId;
      }

      if (filters.dateFrom !== undefined || filters.dateTo !== undefined) {
        where.createdAt = {
          ...(filters.dateFrom !== undefined && { gte: filters.dateFrom }),
          ...(filters.dateTo !== undefined && { lte: filters.dateTo }),
        };
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
      const updateData: Prisma.OrderUpdateInput = { status };

      if (extra?.trackingNumber !== undefined) {
        updateData.trackingNumber = extra.trackingNumber;
      }

      if (extra?.stockDeducted !== undefined) {
        updateData.stockDeducted = extra.stockDeducted;
      }

      const order = await this.prisma.order.update({
        where: { id },
        data: updateData,
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
          status: OrderStatus.PENDING_CONFIRMATION,
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

  async deleteById(id: string): Promise<void> {
    try {
      await this.prisma.order.delete({ where: { id } });
    } catch (error) {
      throw this.handlePrismaError(error, "deleteById");
    }
  }

  /**
   * Captura errores de Prisma y los transforma en AuroraError.
   * Nunca se exponen errores crudos de Prisma fuera de la capa de repositorio (Req 11.3).
   *
   * P2025 (record not found) se mapea a OrderNotFoundError para operaciones sobre pedidos.
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

      if (prismaCode === "P2025") {
        return new OrderNotFoundError();
      }

      if (prismaCode === "P2002") {
        return new AuroraError(
          "REPOSITORY_ERROR",
          `Unique constraint violation in ${operation}`,
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
