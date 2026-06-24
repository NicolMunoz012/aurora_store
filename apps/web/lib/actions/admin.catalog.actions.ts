"use server";
// =============================================================================
// apps/web/lib/actions/admin.catalog.actions.ts (Req 3.5, 16.1, 16.7, 16.9, 17.1–17.4)
// =============================================================================

import { prisma } from "@/lib/db";
import { handleActionError } from "@/lib/action-error";
import type { ActionResult } from "@/lib/types";
import { Decimal } from "decimal.js";
import type { ProductDetail, CategoryRecord, CreateProductData, UpdateProductData, CreateCategoryData, UpdateCategoryData } from "@aurora/shared";
import { auth } from "@/lib/auth";
import {
  createProductUseCase,
  updateProductUseCase,
  toggleProductActiveUseCase,
  createCategoryUseCase,
  updateCategoryUseCase,
  toggleCategoryActiveUseCase,
  deleteCategoryUseCase,
  PrismaCatalogRepository,
  PrismaCategoryRepository,
  CatalogService,
  CategoryService,
} from "@aurora/core/catalog";
import {
  verifyUserRoleUseCase,
  PrismaAuthRepository,
} from "@aurora/core/auth";
import {
  PrismaAuditRepository,
} from "@aurora/core/audit";

// ─── assertAdmin helper ───────────────────────────────────────────────────────

async function assertAdmin(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw Object.assign(new Error("Unauthorized"), { code: "UNAUTHORIZED_ROLE" });
  }
  const authRepo = new PrismaAuthRepository(prisma);
  const isAdmin = await verifyUserRoleUseCase({
    repository: authRepo,
    userId: session.user.id,
    expectedRole: "ADMIN",
  });
  if (!isAdmin) {
    throw Object.assign(new Error("Forbidden"), { code: "UNAUTHORIZED_ROLE" });
  }
  return session.user.id;
}

function buildAuditLogger() {
  const auditRepo = new PrismaAuditRepository(prisma);
  return { log: auditRepo.log.bind(auditRepo) };
}

// ─── Product actions ──────────────────────────────────────────────────────────

const VALID_DISCOUNTS = [5, 10, 15, 20, 25, 30];

function validateDiscountPercentage(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== "number" || !VALID_DISCOUNTS.includes(value)) {
    return "Porcentaje de descuento inválido. Valores permitidos: 5, 10, 15, 20, 25, 30.";
  }
  return null;
}

// Plain-object input accepted from Client Components (no Decimal on the wire)
interface ProductFormInput {
  name: string;
  description?: string | null;
  retailPrice: string;
  wholesalePrice: string;
  stock?: number;
  lowStockAlert?: number;
  minWholesaleQty?: number | null;
  discountPercentage?: number | null;
  brand?: string | null;
  categoryId?: string | null;
  images: { url: string; altText?: string | null; displayOrder?: number }[];
}

export async function createProductAction(
  input: ProductFormInput,
): Promise<ActionResult<ProductDetail>> {
  try {
    await assertAdmin();
    const discountError = validateDiscountPercentage(input.discountPercentage);
    if (discountError) return { data: null, error: { code: "VALIDATION_ERROR", message: discountError } };
    const data: CreateProductData = {
      ...input,
      retailPrice: new Decimal(input.retailPrice),
      wholesalePrice: new Decimal(input.wholesalePrice),
    };
    const repository = new PrismaCatalogRepository(prisma);
    const auditLogger = buildAuditLogger();
    const product = await createProductUseCase({ repository, auditLogger, data });
    return { data: product, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateProductAction(
  productId: string,
  input: ProductFormInput,
): Promise<ActionResult<ProductDetail>> {
  try {
    await assertAdmin();
    const discountError = validateDiscountPercentage(input.discountPercentage);
    if (discountError) return { data: null, error: { code: "VALIDATION_ERROR", message: discountError } };
    const data: UpdateProductData = {
      ...input,
      retailPrice: new Decimal(input.retailPrice),
      wholesalePrice: new Decimal(input.wholesalePrice),
    };
    const repository = new PrismaCatalogRepository(prisma);
    const auditLogger = buildAuditLogger();
    const product = await updateProductUseCase({ repository, auditLogger, productId, data });
    return { data: product, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function toggleProductActiveAction(
  productId: string,
  isActive: boolean,
): Promise<ActionResult<void>> {
  try {
    await assertAdmin();
    const repository = new PrismaCatalogRepository(prisma);
    const auditLogger = buildAuditLogger();
    await toggleProductActiveUseCase({ repository, auditLogger, productId, isActive });
    return { data: undefined, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

// ─── Category actions ─────────────────────────────────────────────────────────

export async function createCategoryAction(
  data: CreateCategoryData,
): Promise<ActionResult<CategoryRecord>> {
  try {
    await assertAdmin();
    const categoryRepository = new PrismaCategoryRepository(prisma);
    const auditLogger = buildAuditLogger();
    const category = await createCategoryUseCase({ categoryRepository, auditLogger, data });
    return { data: category, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateCategoryAction(
  categoryId: string,
  data: UpdateCategoryData,
): Promise<ActionResult<CategoryRecord>> {
  try {
    await assertAdmin();
    const categoryRepository = new PrismaCategoryRepository(prisma);
    const auditLogger = buildAuditLogger();
    const category = await updateCategoryUseCase({ categoryRepository, auditLogger, categoryId, data });
    return { data: category, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function toggleCategoryActiveAction(
  categoryId: string,
  isActive: boolean,
  confirmed = false,
): Promise<ActionResult<{ warningCount?: number }>> {
  try {
    await assertAdmin();
    const categoryRepository = new PrismaCategoryRepository(prisma);

    // Check active product count and warn before deactivating (Req 17.3)
    if (!isActive && !confirmed) {
      const count = await categoryRepository.countActiveProductsInCategory(categoryId);
      if (count > 0) {
        return { data: { warningCount: count }, error: null };
      }
    }

    const auditLogger = buildAuditLogger();
    await toggleCategoryActiveUseCase({ categoryRepository, auditLogger, categoryId, isActive });
    return { data: {}, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteCategoryAction(
  categoryId: string,
): Promise<ActionResult<void>> {
  try {
    await assertAdmin();
    const categoryRepository = new PrismaCategoryRepository(prisma);
    const auditLogger = buildAuditLogger();
    await deleteCategoryUseCase({ categoryRepository, auditLogger, categoryId });
    return { data: undefined, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

/** Cuenta todos los productos (activos e inactivos) de cada categoría. */
export async function getCategoryProductCountsAction(): Promise<
  ActionResult<Record<string, number>>
> {
  try {
    await assertAdmin();
    const categoryRepository = new PrismaCategoryRepository(prisma);
    const all = await categoryRepository.listAll();
    const counts: Record<string, number> = {};
    await Promise.all(
      all.map(async (cat) => {
        counts[cat.id] = await categoryRepository.countProductsInCategory(cat.id);
      }),
    );
    return { data: counts, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}
