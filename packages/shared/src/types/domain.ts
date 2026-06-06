// =============================================================================
// @aurora/shared — Domain Enums, Types & Interfaces
// Fuente de verdad del dominio. Definidos nativamente en @aurora/shared,
// independientes de @aurora/database (Req 1.4, 12.1, 12.2).
// =============================================================================

import { Decimal } from "decimal.js";

// =============================================================================
// ENUMS (const objects con tipos derivados)
// =============================================================================

/** Roles del sistema (RF004) */
export const Role = {
  ADMIN: "ADMIN",
  CLIENT: "CLIENT",
} as const;
export type Role = (typeof Role)[keyof typeof Role];

/** Estado del carrito de compras (DA-002) */
export const CartStatus = {
  ACTIVE: "ACTIVE",
  MERGED: "MERGED",
} as const;
export type CartStatus = (typeof CartStatus)[keyof typeof CartStatus];

/** Estados del ciclo de vida de un pedido (RF046, RF049) */
export const OrderStatus = {
  PENDING_CONFIRMATION: "PENDING_CONFIRMATION",
  PENDING: "PENDING",
  IN_PREPARATION: "IN_PREPARATION",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
  AUTO_CANCELLED: "AUTO_CANCELLED",
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

/** Método de entrega (RF022) */
export const DeliveryMethod = {
  HOME_DELIVERY: "HOME_DELIVERY",
  STORE_PICKUP: "STORE_PICKUP",
} as const;
export type DeliveryMethod =
  (typeof DeliveryMethod)[keyof typeof DeliveryMethod];

/** Tipos de token de seguridad (RF003) */
export const TokenType = {
  PASSWORD_RESET: "PASSWORD_RESET",
  EMAIL_VERIFICATION: "EMAIL_VERIFICATION",
} as const;
export type TokenType = (typeof TokenType)[keyof typeof TokenType];

// =============================================================================
// DOMAIN INTERFACES — Entidades de lectura
// =============================================================================

/** Perfil de usuario público — NUNCA incluye passwordHash (NF003) */
export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  emailVerified: Date | null;
  termsAccepted: boolean;
  createdAt: Date;
}

/** Dirección guardada del usuario (RF037) */
export interface SavedAddressRecord {
  id: string;
  userId: string;
  addressName: string;
  department: string;
  municipality: string;
  address: string;
  neighborhood: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Producto en listado — sin wholesalePrice (NF001) */
export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  retailPrice: Decimal;
  stock: number;
  isActive: boolean;
  mainImageUrl: string;
  mainImageAlt: string | null;
  category: { id: string; name: string; slug: string };
}

/** Imagen de producto */
export interface ProductImageRecord {
  id: string;
  productId: string;
  url: string;
  displayOrder: number;
  altText: string | null;
  createdAt: Date;
}

/**
 * Detalle público de producto — NO incluye wholesalePrice (NF001).
 * Se usa en apps/web. Para uso interno con wholesalePrice, ver InternalProductDetail.
 */
export interface ProductDetail extends ProductListItem {
  description: string | null;
  minWholesaleQty: number | null;
  lowStockAlert: number;
  images: ProductImageRecord[];
}

/**
 * Detalle interno de producto — incluye wholesalePrice.
 * Solo se usa dentro de @aurora/core para PricingService y lógica de negocio.
 */
export interface InternalProductDetail extends ProductDetail {
  wholesalePrice: Decimal;
}

/** Carrito con items (RF014, RF016) */
export interface CartWithItems {
  id: string;
  userId: string | null;
  sessionId: string | null;
  status: CartStatus;
  items: CartItemWithProduct[];
}

/** Item del carrito con datos del producto para pricing */
export interface CartItemWithProduct {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    retailPrice: Decimal;
    wholesalePrice: Decimal;
    stock: number;
    isActive: boolean;
    mainImageUrl: string;
  };
}

/** Registro base de carrito (sin items) */
export interface CartRecord {
  id: string;
  userId: string | null;
  sessionId: string | null;
  status: CartStatus;
  createdAt: Date;
  updatedAt: Date;
}

/** Registro base de item del carrito (sin producto expandido) */
export interface CartItemRecord {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

/** Pedido completo con items (RF034, RF045) */
export interface OrderWithItems {
  id: string;
  userId: string | null;
  clientName: string;
  clientPhone: string;
  clientEmail: string | null;
  status: OrderStatus;
  deliveryMethod: DeliveryMethod;
  shippingDepartment: string | null;
  shippingMunicipality: string | null;
  shippingAddress: string | null;
  shippingNeighborhood: string | null;
  storePickupAddress: string | null;
  trackingNumber: string | null;
  productsTotal: Decimal;
  wholesalePriceApplied: boolean;
  stockDeducted: boolean;
  expiresAt: Date | null;
  createdAt: Date;
  items: OrderItemRecord[];
}

/** Resumen de pedido para listados */
export interface OrderSummary {
  id: string;
  userId: string | null;
  clientName: string;
  clientPhone: string;
  status: OrderStatus;
  deliveryMethod: DeliveryMethod;
  productsTotal: Decimal;
  wholesalePriceApplied: boolean;
  createdAt: Date;
}

/** Item de un pedido — snapshot inmutable (DA-005) */
export interface OrderItemRecord {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPriceAtPurchase: Decimal;
  createdAt: Date;
}

/** Registro base de pedido (sin items) */
export interface OrderRecord {
  id: string;
  userId: string | null;
  clientName: string;
  clientPhone: string;
  clientEmail: string | null;
  status: OrderStatus;
  deliveryMethod: DeliveryMethod;
  shippingDepartment: string | null;
  shippingMunicipality: string | null;
  shippingAddress: string | null;
  shippingNeighborhood: string | null;
  storePickupAddress: string | null;
  trackingNumber: string | null;
  productsTotal: Decimal;
  wholesalePriceApplied: boolean;
  termsAccepted: boolean;
  stockDeducted: boolean;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Configuración global de la tienda — singleton (DA-003) */
export interface StoreConfigRecord {
  id: string;
  wholesaleThreshold: Decimal;
  whatsappNumber: string;
  storePhysicalAddress: string;
  anonOrderExpiryDays: number;
  registeredOrderExpiryDays: number;
}

/** Registro de auditoría (NF010, DA-007) */
export interface AuditLogRecord {
  id: string;
  userId: string | null;
  action: string;
  affectedEntity: string;
  entityId: string;
  previousData: unknown | null;
  newData: unknown | null;
  note: string | null;
  createdAt: Date;
}

/** Producto con stock bajo (RF031) */
export interface LowStockProduct {
  id: string;
  name: string;
  slug: string;
  stock: number;
  lowStockAlert: number;
  isActive: boolean;
}

/** Registro de stock de un producto */
export interface StockRecord {
  productId: string;
  stock: number;
  lowStockAlert: number;
}

/** Resultado de validación de stock antes del checkout (RF029) */
export interface StockValidationResult {
  valid: boolean;
  insufficientItems: Array<{
    productId: string;
    productName: string;
    requested: number;
    available: number;
  }>;
}

// =============================================================================
// INPUTS / DTOs
// =============================================================================

/** Datos para upsert de usuario desde proveedor externo (Auth.js) */
export interface UpsertUserFromProviderData {
  email: string;
  fullName: string;
  emailVerified: Date | null;
}

/** Datos para actualizar perfil (RF036) */
export interface UpdateProfileData {
  fullName?: string;
  email?: string;
}

/** Datos para crear dirección guardada (RF037) */
export interface CreateAddressData {
  addressName: string;
  department: string;
  municipality: string;
  address: string;
  neighborhood?: string | null;
}

/** Filtros para listar productos (RF009, RF010) */
export interface ProductFilters {
  categoryIds?: string[];
  search?: string;
  isActive?: boolean;
}

/** Datos para crear producto (RF040) */
export interface CreateProductData {
  name: string;
  description?: string | null;
  retailPrice: Decimal;
  wholesalePrice: Decimal;
  stock?: number;
  lowStockAlert?: number;
  minWholesaleQty?: number | null;
  categoryId: string;
  images: AddImageData[];
}

/** Datos para actualizar producto (RF041) */
export interface UpdateProductData {
  name?: string;
  description?: string | null;
  retailPrice?: Decimal;
  wholesalePrice?: Decimal;
  stock?: number;
  lowStockAlert?: number;
  minWholesaleQty?: number | null;
  categoryId?: string;
  isActive?: boolean;
}

/** Datos para agregar imagen a un producto */
export interface AddImageData {
  url: string;
  displayOrder?: number;
  altText?: string | null;
}

/** Datos para crear categoría (RF043) */
export interface CreateCategoryData {
  name: string;
}

/** Datos para actualizar categoría (RF043) */
export interface UpdateCategoryData {
  name?: string;
  isActive?: boolean;
}

/** Registro de categoría */
export interface CategoryRecord {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Datos para crear carrito */
export interface CreateCartData {
  userId?: string | null;
  sessionId?: string | null;
}

/** Datos para crear pedido (RF025) */
export interface CreateOrderData {
  userId: string | null;
  clientName: string;
  clientPhone: string;
  clientEmail?: string | null;
  deliveryMethod: DeliveryMethod;
  shippingDepartment?: string | null;
  shippingMunicipality?: string | null;
  shippingAddress?: string | null;
  shippingNeighborhood?: string | null;
  storePickupAddress?: string | null;
  productsTotal: Decimal;
  wholesalePriceApplied: boolean;
  termsAccepted: boolean;
  expiresAt: Date;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPriceAtPurchase: Decimal;
  }>;
}

/** Filtros para listado admin de pedidos (RF045) */
export interface AdminOrderFilters {
  status?: OrderStatus;
  userId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

/** Datos extra al actualizar estado del pedido */
export interface UpdateOrderExtra {
  trackingNumber?: string | null;
  stockDeducted?: boolean;
}

/** Datos para crear registro de auditoría (NF010, DA-007) */
export interface CreateAuditLogData {
  userId: string | null;
  action: string;
  affectedEntity: string;
  entityId: string;
  previousData?: unknown | null;
  newData?: unknown | null;
  note?: string | null;
}

/** Filtros para consulta de auditoría (NF010) */
export interface AuditFilters {
  userId?: string;
  action?: string;
  affectedEntity?: string;
  entityId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

/** Datos para actualizar configuración de tienda (RF048, RF050, RF051) */
export interface UpdateStoreConfigData {
  wholesaleThreshold?: Decimal;
  whatsappNumber?: string;
  storePhysicalAddress?: string;
  anonOrderExpiryDays?: number;
  registeredOrderExpiryDays?: number;
}
