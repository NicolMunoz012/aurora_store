"use server";
// =============================================================================
// apps/web/lib/actions/admin.product-brands.actions.ts
// CRUD de marcas de productos. Protegido con assertAdmin().
// =============================================================================

import { prisma } from "@/lib/db";
import { handleActionError } from "@/lib/action-error";
import type { ActionResult } from "@/lib/types";
import { auth } from "@/lib/auth";
import { verifyUserRoleUseCase, PrismaAuthRepository } from "@aurora/core/auth";
import type { ProductBrandRecord } from "@aurora/shared";
import {
  PrismaProductBrandRepository,
  createProductBrandUseCase,
  updateProductBrandUseCase,
  toggleProductBrandActiveUseCase,
  deleteProductBrandUseCase,
} from "@aurora/core/catalog";

// ─── Auth guard ───────────────────────────────────────────────────────────────

async function assertAdmin(): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw Object.assign(new Error("Unauthorized"), { code: "UNAUTHORIZED_ROLE" });
  const authRepo = new PrismaAuthRepository(prisma);
  const isAdmin = await verifyUserRoleUseCase({
    repository: authRepo,
    userId: session.user.id,
    expectedRole: "ADMIN",
  });
  if (!isAdmin) throw Object.assign(new Error("Forbidden"), { code: "UNAUTHORIZED_ROLE" });
}

// ─── Actions ──────────────────────────────────────────────────────────────────

/** Lista todas las marcas de productos (activas e inactivas). */
export async function listProductBrandsAction(): Promise<ActionResult<ProductBrandRecord[]>> {
  try {
    const repo = new PrismaProductBrandRepository(prisma);
    const brands = await repo.listAll();
    return { data: brands, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

/** Lista solo marcas activas — para selectores en formularios de producto. */
export async function listActiveProductBrandsAction(): Promise<ActionResult<ProductBrandRecord[]>> {
  try {
    const repo = new PrismaProductBrandRepository(prisma);
    const brands = await repo.listActive();
    return { data: brands, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

/** Crea una marca de producto. Valida nombre único (case-insensitive). */
export async function createProductBrandAction(
  name: string,
): Promise<ActionResult<ProductBrandRecord>> {
  try {
    await assertAdmin();
    const repo = new PrismaProductBrandRepository(prisma);
    const brand = await createProductBrandUseCase({ repository: repo, data: { name } });
    return { data: brand, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

/** Renombra una marca. Valida unicidad del nuevo nombre. */
export async function updateProductBrandAction(
  id: string,
  name: string,
): Promise<ActionResult<ProductBrandRecord>> {
  try {
    await assertAdmin();
    const repo = new PrismaProductBrandRepository(prisma);
    const brand = await updateProductBrandUseCase({ repository: repo, id, data: { name } });
    return { data: brand, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

/** Activa o desactiva una marca. */
export async function toggleProductBrandActiveAction(
  id: string,
  isActive: boolean,
): Promise<ActionResult<ProductBrandRecord>> {
  try {
    await assertAdmin();
    const repo = new PrismaProductBrandRepository(prisma);
    const brand = await toggleProductBrandActiveUseCase({ repository: repo, id, isActive });
    return { data: brand, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

/**
 * Elimina una marca físicamente.
 * Falla si tiene productos asociados (use case lo valida).
 */
export async function deleteProductBrandAction(
  id: string,
): Promise<ActionResult<void>> {
  try {
    await assertAdmin();
    const repo = new PrismaProductBrandRepository(prisma);
    await deleteProductBrandUseCase({ repository: repo, id });
    return { data: undefined, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

/** Retorna cuántos productos tiene asignada cada marca. */
export async function getProductBrandCountsAction(): Promise<ActionResult<Record<string, number>>> {
  try {
    await assertAdmin();
    const repo = new PrismaProductBrandRepository(prisma);
    const brands = await repo.listAll();
    const counts: Record<string, number> = {};
    await Promise.all(
      brands.map(async (b) => {
        counts[b.id] = await repo.countProducts(b.id);
      }),
    );
    return { data: counts, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}
