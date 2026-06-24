// =============================================================================
// apps/web/lib/serializers.ts
// Decimal→string serializer functions para serialización JSON-safe (Req 5.8, 21.1).
// Next.js no puede pasar objetos Decimal de servidor a cliente; estas funciones
// convierten cada campo Decimal a string antes de cruzar el boundary.
// =============================================================================

import type {
  ProductListItem,
  ProductDetail,
  InternalProductDetail,
  OrderWithItems,
  OrderItemRecord,
  OrderSummary,
} from "@aurora/shared";
import type { ResolvedCart, ResolvedCartItem } from "@aurora/core/pricing";

// ─── Serialized Interfaces ────────────────────────────────────────────────────

export interface SerializedProductListItem
  extends Omit<ProductListItem, "retailPrice"> {
  retailPrice: string;
}

export interface SerializedProductDetail
  extends Omit<ProductDetail, "retailPrice"> {
  retailPrice: string;
}

export interface SerializedInternalProductDetail
  extends Omit<InternalProductDetail, "retailPrice" | "wholesalePrice"> {
  retailPrice: string;
  wholesalePrice: string;
}

export interface SerializedOrderItemRecord
  extends Omit<OrderItemRecord, "unitPriceAtPurchase"> {
  unitPriceAtPurchase: string;
}

export interface SerializedOrderWithItems
  extends Omit<OrderWithItems, "productsTotal" | "items"> {
  productsTotal: string;
  items: SerializedOrderItemRecord[];
}

export interface SerializedOrderSummary
  extends Omit<OrderSummary, "productsTotal"> {
  productsTotal: string;
}

export interface SerializedResolvedCartItem
  extends Omit<
    ResolvedCartItem,
    "unitPrice" | "retailPrice" | "wholesalePrice" | "lineTotal"
  > {
  unitPrice: string;
  retailPrice: string;
  wholesalePrice: string;
  lineTotal: string;
}

export interface SerializedResolvedCart
  extends Omit<
    ResolvedCart,
    "items" | "retailSubtotal" | "finalSubtotal" | "amountToThreshold"
  > {
  items: SerializedResolvedCartItem[];
  retailSubtotal: string;
  finalSubtotal: string;
  amountToThreshold: string | null;
}

// ─── Serializer Functions ─────────────────────────────────────────────────────

export function serializeProductListItem(
  product: ProductListItem,
): SerializedProductListItem {
  return {
    ...product,
    retailPrice: product.retailPrice.toString(),
  };
}

export function serializeProductDetail(
  product: ProductDetail,
): SerializedProductDetail {
  const { wholesalePrice: _w, ...rest } = product as ProductDetail & { wholesalePrice?: unknown };
  return {
    ...rest,
    retailPrice: product.retailPrice.toString(),
  };
}

export function serializeInternalProductDetail(
  product: InternalProductDetail,
): SerializedInternalProductDetail {
  return {
    ...product,
    retailPrice: product.retailPrice.toString(),
    wholesalePrice: product.wholesalePrice.toString(),
  };
}

export function serializeOrderItemRecord(
  item: OrderItemRecord,
): SerializedOrderItemRecord {
  return {
    ...item,
    unitPriceAtPurchase: item.unitPriceAtPurchase.toString(),
  };
}

export function serializeOrderWithItems(
  order: OrderWithItems,
): SerializedOrderWithItems {
  return {
    ...order,
    productsTotal: order.productsTotal.toString(),
    items: order.items.map(serializeOrderItemRecord),
  };
}

export function serializeOrderSummary(
  order: OrderSummary,
): SerializedOrderSummary {
  return {
    ...order,
    productsTotal: order.productsTotal.toString(),
  };
}

export function serializeResolvedCartItem(
  item: ResolvedCartItem,
): SerializedResolvedCartItem {
  return {
    ...item,
    unitPrice: item.unitPrice.toString(),
    retailPrice: item.retailPrice.toString(),
    wholesalePrice: item.wholesalePrice.toString(),
    lineTotal: item.lineTotal.toString(),
  };
}

export function serializeResolvedCart(
  cart: ResolvedCart,
): SerializedResolvedCart {
  return {
    ...cart,
    items: cart.items.map(serializeResolvedCartItem),
    retailSubtotal: cart.retailSubtotal.toString(),
    finalSubtotal: cart.finalSubtotal.toString(),
    amountToThreshold: cart.amountToThreshold?.toString() ?? null,
  };
}
