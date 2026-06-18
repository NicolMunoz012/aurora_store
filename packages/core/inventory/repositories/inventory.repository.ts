// =============================================================================
// @aurora/core/inventory — PrismaInventoryRepository
// Implementación Prisma del repositorio de inventario (Req 1.6, 7.1–7.8).
// Encapsula todas las operaciones de acceso a datos de stock,
// mapeando resultados Prisma a tipos de dominio y capturando errores Prisma
// para re-lanzarlos como AuroraError.
//
// NOTA: deductStock usa $executeRaw para garantizar atomicidad con
// UPDATE ... WHERE stock >= quantity. Si 0 filas afectadas → InsufficientStockError.
// =============================================================================

import type { PrismaClient } from "@aurora/database";
import type {
  StockRecord,
  LowStockProduct,
  StockValidationResult,
} from "@aurora/shared";
import { AuroraError, InsufficientStockError } from "@aurora/shared";
import type { IInventoryRepository } from "./inventory.repository.interface";

/**
 * Mapea un registro de producto Prisma al tipo de dominio StockRecord.
 */
function mapToStockRecord(product: {
  id: string;
  stock: number;
  lowStockAlert: number;
}): StockRecord {
  return {
    productId: product.id,
    stock: product.stock,
    lowStockAlert: product.lowStockAlert,
  };
}

export class PrismaInventoryRepository implements IInventoryRepository {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findProductStock(productId: string): Promise<StockRecord | null> {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
        select: {
          id: true,
          stock: true,
          lowStockAlert: true,
        },
      });

      return product ? mapToStockRecord(product) : null;
    } catch (error) {
      throw this.handlePrismaError(error, "findProductStock");
    }
  }

  async deductStock(productId: string, quantity: number): Promise<StockRecord> {
    try {
      // Atomic UPDATE WHERE stock >= quantity para prevenir race conditions
      const affectedRows = await this.prisma.$executeRaw`
        UPDATE products
        SET stock = stock - ${quantity}, "updatedAt" = NOW()
        WHERE id = ${productId} AND stock >= ${quantity}
      `;

      if (affectedRows === 0) {
        throw new InsufficientStockError(productId);
      }

      // Leer el stock actualizado para retornarlo
      const product = await this.prisma.product.findUniqueOrThrow({
        where: { id: productId },
        select: {
          id: true,
          stock: true,
          lowStockAlert: true,
        },
      });

      return mapToStockRecord(product);
    } catch (error) {
      throw this.handlePrismaError(error, "deductStock");
    }
  }

  async addStock(productId: string, quantity: number): Promise<StockRecord> {
    try {
      // Atomic increment del stock
      const product = await this.prisma.product.update({
        where: { id: productId },
        data: {
          stock: { increment: quantity },
        },
        select: {
          id: true,
          stock: true,
          lowStockAlert: true,
        },
      });

      return mapToStockRecord(product);
    } catch (error) {
      throw this.handlePrismaError(error, "addStock");
    }
  }

  async setStock(productId: string, quantity: number): Promise<StockRecord> {
    try {
      const product = await this.prisma.product.update({
        where: { id: productId },
        data: {
          stock: quantity,
        },
        select: {
          id: true,
          stock: true,
          lowStockAlert: true,
        },
      });

      return mapToStockRecord(product);
    } catch (error) {
      throw this.handlePrismaError(error, "setStock");
    }
  }

  async findLowStockProducts(): Promise<LowStockProduct[]> {
    try {
      // Prisma no soporta comparación columna-contra-columna directamente.
      // Usamos $queryRaw para: WHERE stock <= "lowStockAlert"
      const products = await this.prisma.$queryRaw<
        Array<{
          id: string;
          name: string;
          slug: string;
          stock: number;
          lowStockAlert: number;
          isActive: boolean;
        }>
      >`
        SELECT id, name, slug, stock, "lowStockAlert" AS "lowStockAlert", "isActive" AS "isActive"
        FROM products
        WHERE stock <= "lowStockAlert"
      `;

      return products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        stock: p.stock,
        lowStockAlert: p.lowStockAlert,
        isActive: p.isActive,
      }));
    } catch (error) {
      throw this.handlePrismaError(error, "findLowStockProducts");
    }
  }

  async validateStockForItems(
    items: Array<{ productId: string; quantity: number }>,
  ): Promise<StockValidationResult> {
    try {
      const insufficientItems: StockValidationResult["insufficientItems"] = [];

      // Fetch todos los productos en una sola query
      const productIds = items.map((item) => item.productId);
      const products = await this.prisma.product.findMany({
        where: { id: { in: productIds } },
        select: {
          id: true,
          name: true,
          stock: true,
        },
      });

      const productMap = new Map(products.map((p) => [p.id, p]));

      for (const item of items) {
        const product = productMap.get(item.productId);

        if (!product) {
          // Producto no encontrado — tratar como stock 0
          insufficientItems.push({
            productId: item.productId,
            productName: "Unknown product",
            requested: item.quantity,
            available: 0,
          });
          continue;
        }

        if (product.stock < item.quantity) {
          insufficientItems.push({
            productId: item.productId,
            productName: product.name,
            requested: item.quantity,
            available: product.stock,
          });
        }
      }

      return {
        valid: insufficientItems.length === 0,
        insufficientItems,
      };
    } catch (error) {
      throw this.handlePrismaError(error, "validateStockForItems");
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

    // Prisma known request errors have a `code` property (e.g. P2002 for unique constraint)
    if (
      error instanceof Error &&
      "code" in error &&
      typeof (error as Record<string, unknown>).code === "string"
    ) {
      const prismaCode = (error as Record<string, unknown>).code as string;

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
