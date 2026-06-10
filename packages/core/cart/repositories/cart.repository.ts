// =============================================================================
// @aurora/core/cart — PrismaCartRepository
// Implementación Prisma del repositorio de carrito (Req 1.6, 5.1–5.7).
// Encapsula todas las operaciones de acceso a datos de carrito,
// mapeando resultados Prisma a tipos de dominio y capturando errores Prisma
// para re-lanzarlos como AuroraError.
// =============================================================================

import type { PrismaClient } from "@aurora/database/generated/prisma/client.js";
import type {
  CartWithItems,
  CartRecord,
  CartItemRecord,
  CartItemWithProduct,
  CartStatus,
  CreateCartData,
} from "@aurora/shared";
import { AuroraError } from "@aurora/shared";
import { Decimal } from "decimal.js";
import type { ICartRepository } from "./cart.repository.interface.js";

// ─── Prisma include/select constants ──────────────────────────────────────────

/**
 * Include para obtener items del carrito con datos del producto necesarios
 * para CartItemWithProduct (pricing, stock, imagen principal).
 */
const CART_ITEMS_WITH_PRODUCT_INCLUDE = {
  items: {
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          retailPrice: true,
          wholesalePrice: true,
          stock: true,
          isActive: true,
          images: {
            select: { url: true },
            orderBy: { displayOrder: "asc" as const },
            take: 1,
          },
        },
      },
    },
  },
} as const;

// ─── Helper mappers ───────────────────────────────────────────────────────────

/**
 * Mapea un item de carrito Prisma (con producto incluido) a CartItemWithProduct.
 */
function mapToCartItemWithProduct(item: {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    retailPrice: unknown;
    wholesalePrice: unknown;
    stock: number;
    isActive: boolean;
    images: Array<{ url: string }>;
  };
}): CartItemWithProduct {
  return {
    id: item.id,
    quantity: item.quantity,
    product: {
      id: item.product.id,
      name: item.product.name,
      slug: item.product.slug,
      retailPrice: new Decimal(item.product.retailPrice!.toString()),
      wholesalePrice: new Decimal(item.product.wholesalePrice!.toString()),
      stock: item.product.stock,
      isActive: item.product.isActive,
      mainImageUrl: item.product.images[0]?.url ?? "",
    },
  };
}

/**
 * Mapea un carrito Prisma con items a CartWithItems.
 */
function mapToCartWithItems(cart: {
  id: string;
  userId: string | null;
  sessionId: string | null;
  status: string;
  items: Array<{
    id: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      slug: string;
      retailPrice: unknown;
      wholesalePrice: unknown;
      stock: number;
      isActive: boolean;
      images: Array<{ url: string }>;
    };
  }>;
}): CartWithItems {
  return {
    id: cart.id,
    userId: cart.userId,
    sessionId: cart.sessionId,
    status: cart.status as CartStatus,
    items: cart.items.map(mapToCartItemWithProduct),
  };
}

/**
 * Mapea un registro base de carrito Prisma a CartRecord.
 */
function mapToCartRecord(cart: {
  id: string;
  userId: string | null;
  sessionId: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}): CartRecord {
  return {
    id: cart.id,
    userId: cart.userId,
    sessionId: cart.sessionId,
    status: cart.status as CartStatus,
    createdAt: cart.createdAt,
    updatedAt: cart.updatedAt,
  };
}

/**
 * Mapea un registro de item Prisma a CartItemRecord.
 */
function mapToCartItemRecord(item: {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}): CartItemRecord {
  return {
    id: item.id,
    cartId: item.cartId,
    productId: item.productId,
    quantity: item.quantity,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

// ─── Repository Implementation ───────────────────────────────────────────────

export class PrismaCartRepository implements ICartRepository {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findActiveCartByUserId(userId: string): Promise<CartWithItems | null> {
    try {
      const cart = await this.prisma.cart.findFirst({
        where: { userId, status: "ACTIVE" },
        include: CART_ITEMS_WITH_PRODUCT_INCLUDE,
      });

      return cart ? mapToCartWithItems(cart) : null;
    } catch (error) {
      throw this.handlePrismaError(error, "findActiveCartByUserId");
    }
  }

  async findActiveCartBySessionId(
    sessionId: string,
  ): Promise<CartWithItems | null> {
    try {
      const cart = await this.prisma.cart.findFirst({
        where: { sessionId, status: "ACTIVE" },
        include: CART_ITEMS_WITH_PRODUCT_INCLUDE,
      });

      return cart ? mapToCartWithItems(cart) : null;
    } catch (error) {
      throw this.handlePrismaError(error, "findActiveCartBySessionId");
    }
  }

  async createCart(data: CreateCartData): Promise<CartRecord> {
    try {
      const cart = await this.prisma.cart.create({
        data: {
          userId: data.userId ?? null,
          sessionId: data.sessionId ?? null,
        },
      });

      return mapToCartRecord(cart);
    } catch (error) {
      throw this.handlePrismaError(error, "createCart");
    }
  }

  async addItem(
    cartId: string,
    productId: string,
    quantity: number,
  ): Promise<CartItemRecord> {
    try {
      const item = await this.prisma.cartItem.create({
        data: { cartId, productId, quantity },
      });

      return mapToCartItemRecord(item);
    } catch (error) {
      throw this.handlePrismaError(error, "addItem");
    }
  }

  async updateItemQuantity(
    cartItemId: string,
    quantity: number,
  ): Promise<CartItemRecord> {
    try {
      const item = await this.prisma.cartItem.update({
        where: { id: cartItemId },
        data: { quantity },
      });

      return mapToCartItemRecord(item);
    } catch (error) {
      throw this.handlePrismaError(error, "updateItemQuantity");
    }
  }

  async removeItem(cartItemId: string): Promise<void> {
    try {
      await this.prisma.cartItem.delete({
        where: { id: cartItemId },
      });
    } catch (error) {
      throw this.handlePrismaError(error, "removeItem");
    }
  }

  async clearItems(cartId: string): Promise<void> {
    try {
      await this.prisma.cartItem.deleteMany({
        where: { cartId },
      });
    } catch (error) {
      throw this.handlePrismaError(error, "clearItems");
    }
  }

  async mergeCartItems(
    sourceCartId: string,
    targetCartId: string,
  ): Promise<void> {
    try {
      await this.prisma.$transaction(async (tx) => {
        const sourceItems = await tx.cartItem.findMany({
          where: { cartId: sourceCartId },
        });

        for (const sourceItem of sourceItems) {
          const existingItem = await tx.cartItem.findUnique({
            where: {
              cartId_productId: {
                cartId: targetCartId,
                productId: sourceItem.productId,
              },
            },
          });

          if (existingItem) {
            // Producto ya existe en el carrito destino: sumar cantidades
            await tx.cartItem.update({
              where: { id: existingItem.id },
              data: { quantity: existingItem.quantity + sourceItem.quantity },
            });
          } else {
            // Producto no existe en el carrito destino: mover el item
            await tx.cartItem.update({
              where: { id: sourceItem.id },
              data: { cartId: targetCartId },
            });
          }
        }
      });
    } catch (error) {
      throw this.handlePrismaError(error, "mergeCartItems");
    }
  }

  async setCartStatus(
    cartId: string,
    status: CartStatus,
    clearSessionId?: boolean,
  ): Promise<void> {
    try {
      await this.prisma.cart.update({
        where: { id: cartId },
        data: {
          status,
          ...(clearSessionId === true && { sessionId: null }),
        },
      });
    } catch (error) {
      throw this.handlePrismaError(error, "setCartStatus");
    }
  }

  async findCartItemByProduct(
    cartId: string,
    productId: string,
  ): Promise<CartItemRecord | null> {
    try {
      const item = await this.prisma.cartItem.findUnique({
        where: {
          cartId_productId: { cartId, productId },
        },
      });

      return item ? mapToCartItemRecord(item) : null;
    } catch (error) {
      throw this.handlePrismaError(error, "findCartItemByProduct");
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
