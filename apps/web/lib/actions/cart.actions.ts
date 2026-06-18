"use server";
// =============================================================================
// apps/web/lib/actions/cart.actions.ts
// Server Actions para gestión del carrito (Req 6.1, 6.4, 6.5, 7.1–7.3, 8.1–8.4).
// =============================================================================

import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { handleActionError } from "@/lib/action-error";
import { serializeResolvedCart, type SerializedResolvedCart } from "@/lib/serializers";
import type { ActionResult } from "@/lib/types";
import type { CartWithItems } from "@aurora/shared";
import { auth } from "@/lib/auth";
import {
  getOrCreateCartUseCase,
  addItemToCartUseCase,
  updateCartItemUseCase,
  removeCartItemUseCase,
  mergeCartsUseCase,
  getCartWithPricingUseCase,
  PrismaCartRepository,
} from "@aurora/core/cart";
import {
  getStoreConfigUseCase,
  PrismaStoreConfigRepository,
} from "@aurora/core/store-config";
import { PricingService } from "@aurora/core/pricing";

// Helper to reload cart with full items data
async function reloadCart(cartId: string): Promise<CartWithItems> {
  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              retailPrice: true,
              wholesalePrice: true,
              minWholesaleQty: true,
              stock: true,
              isActive: true,
              images: {
                orderBy: { displayOrder: "asc" },
                take: 1,
                select: { url: true, altText: true },
              },
            },
          },
        },
      },
    },
  });
  if (!cart) throw Object.assign(new Error("Cart not found"), { code: "ENTITY_NOT_FOUND" });
  
  // Transform to match CartWithItems type
  return {
    id: cart.id,
    userId: cart.userId,
    sessionId: cart.sessionId,
    status: cart.status,
    items: cart.items.map(item => ({
      id: item.id,
      quantity: item.quantity,
      product: {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        retailPrice: item.product.retailPrice,
        wholesalePrice: item.product.wholesalePrice,
        stock: item.product.stock,
        isActive: item.product.isActive,
        mainImageUrl: item.product.images[0]?.url ?? '',
      },
    })),
  };
}

export async function getOrCreateCartAction(
  sessionId: string,
): Promise<ActionResult<CartWithItems>> {
  try {
    const session = await auth();
    const repository = new PrismaCartRepository(prisma);
    const cart = await getOrCreateCartUseCase({
      repository,
      userId: session?.user?.id ?? null,
      sessionId,
    });
    return { data: cart, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function addItemToCartAction(params: {
  cartId: string;
  productId: string;
  quantity: number;
}): Promise<ActionResult<CartWithItems>> {
  try {
    const repository = new PrismaCartRepository(prisma);
    await addItemToCartUseCase({
      repository,
      cartId: params.cartId,
      productId: params.productId,
      quantity: params.quantity,
    });
    const cart = await reloadCart(params.cartId);
    return { data: cart, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateCartItemAction(params: {
  cartItemId: string;
  cartId: string;
  quantity: number;
}): Promise<ActionResult<CartWithItems>> {
  try {
    const repository = new PrismaCartRepository(prisma);
    // If quantity <= 0, remove the item instead (Req 8.2)
    if (params.quantity <= 0) {
      await removeCartItemUseCase({
        repository,
        cartItemId: params.cartItemId,
      });
      const cart = await reloadCart(params.cartId);
      return { data: cart, error: null };
    }
    await updateCartItemUseCase({
      repository,
      cartItemId: params.cartItemId,
      cartId: params.cartId,
      quantity: params.quantity,
    });
    const cart = await reloadCart(params.cartId);
    return { data: cart, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function removeCartItemAction(params: {
  cartItemId: string;
  cartId: string;
}): Promise<ActionResult<CartWithItems>> {
  try {
    const repository = new PrismaCartRepository(prisma);
    await removeCartItemUseCase({
      repository,
      cartItemId: params.cartItemId,
    });
    const cart = await reloadCart(params.cartId);
    return { data: cart, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function getCartWithPricingAction(
  sessionId: string,
): Promise<ActionResult<SerializedResolvedCart | null>> {
  try {
    const session = await auth();
    const cartRepository = new PrismaCartRepository(prisma);
    const configRepository = new PrismaStoreConfigRepository(prisma);
    const pricingService = new PricingService();
    const config = await getStoreConfigUseCase({ repository: configRepository });

    const resolvedCart = await getCartWithPricingUseCase({
      repository: cartRepository,
      pricingService,
      config,
      userId: session?.user?.id ?? null,
      sessionId,
    });

    if (!resolvedCart) return { data: null, error: null };
    return { data: serializeResolvedCart(resolvedCart), error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function mergeCartsAction(params: {
  sessionId: string;
  userId: string;
}): Promise<ActionResult<CartWithItems>> {
  try {
    const repository = new PrismaCartRepository(prisma);
    const cart = await mergeCartsUseCase({
      repository,
      userId: params.userId,
      sessionId: params.sessionId,
    });

    // Expire the aurora_session_id cookie on successful merge (Req 7.2, DA-002)
    const cookieStore = await cookies();
    cookieStore.set("aurora_session_id", "", {
      maxAge: 0,
      path: "/",
    });

    return { data: cart, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}
