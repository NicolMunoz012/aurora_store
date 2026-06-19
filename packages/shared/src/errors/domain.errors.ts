/**
 * @aurora/shared — Domain Error Hierarchy
 *
 * Base class and subclasses for all domain errors in the Aurora system.
 * Every Use Case in @aurora/core throws only AuroraError subclasses (Req 11.1, 11.3).
 * Each error carries a machine-readable `code` and a human-readable `message` (Req 11.2).
 */

// ─── Base Class ───────────────────────────────────────────────────────────────

export class AuroraError extends Error {
  public readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// ─── Identity Errors ──────────────────────────────────────────────────────────

export class UserNotFoundError extends AuroraError {
  public readonly userId?: string;

  constructor(userId?: string) {
    const message = userId
      ? `User with id "${userId}" was not found`
      : 'User not found';
    super('USER_NOT_FOUND', message);
    this.userId = userId;
  }
}

export class UnauthorizedRoleError extends AuroraError {
  constructor() {
    super('UNAUTHORIZED_ROLE', 'User does not have the required role');
  }
}

// ─── Catalog Errors ───────────────────────────────────────────────────────────

export class ProductNotFoundError extends AuroraError {
  constructor() {
    super('PRODUCT_NOT_FOUND', 'Product not found');
  }
}

export class ProductRequiresImageError extends AuroraError {
  constructor() {
    super('PRODUCT_REQUIRES_IMAGE', 'A product requires at least one image');
  }
}

export class SlugAlreadyExistsError extends AuroraError {
  public readonly slug?: string;

  constructor(slug?: string) {
    const message = slug
      ? `The slug "${slug}" is already in use`
      : 'Slug already exists';
    super('SLUG_ALREADY_EXISTS', message);
    this.slug = slug;
  }
}

// ─── Cart & Orders Errors ─────────────────────────────────────────────────────

export class InsufficientStockError extends AuroraError {
  public readonly productId: string;

  constructor(productId: string) {
    super(
      'INSUFFICIENT_STOCK',
      `Insufficient stock for product "${productId}"`,
    );
    this.productId = productId;
  }
}

export class CartNotFoundError extends AuroraError {
  constructor() {
    super('CART_NOT_FOUND', 'Cart not found');
  }
}

export class OrderNotFoundError extends AuroraError {
  constructor() {
    super('ORDER_NOT_FOUND', 'Order not found');
  }
}

export class InvalidOrderTransitionError extends AuroraError {
  public readonly from: string;
  public readonly to: string;

  constructor(from: string, to: string) {
    super(
      'INVALID_ORDER_TRANSITION',
      `Invalid order status transition from "${from}" to "${to}"`,
    );
    this.from = from;
    this.to = to;
  }
}

// ─── Users Errors ─────────────────────────────────────────────────────────────

export class EmailAlreadyInUseError extends AuroraError {
  constructor() {
    super('EMAIL_ALREADY_IN_USE', 'The email address is already in use');
  }
}

// ─── Configuration Errors ─────────────────────────────────────────────────────

export class StoreConfigNotInitializedError extends AuroraError {
  constructor() {
    super(
      'STORE_CONFIG_NOT_INITIALIZED',
      'Store configuration has not been initialized',
    );
  }
}
