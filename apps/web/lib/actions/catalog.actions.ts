"use server";
// =============================================================================
// apps/web/lib/actions/catalog.actions.ts
// Server Actions para el catálogo público (Req 5.1, 5.4, 5.5, 9.3).
// =============================================================================

import { prisma } from "@/lib/db";
import { handleActionError } from "@/lib/action-error";
import {
  serializeProductListItem,
  serializeProductDetail,
  serializeInternalProductDetail,
  type SerializedProductListItem,
  type SerializedProductDetail,
  type SerializedInternalProductDetail,
} from "@/lib/serializers";
import type { ActionResult } from "@/lib/types";
import type { StoreConfigRecord, CategoryRecord } from "@aurora/shared";
import {
  listProductsUseCase,
  searchProductsUseCase,
  getProductBySlugUseCase,
  PrismaCatalogRepository,
  PrismaCategoryRepository,

} from "@aurora/core/catalog";
import {
  getStoreConfigUseCase,
  PrismaStoreConfigRepository,
} from "@aurora/core/store-config";

export async function listProductsAction(params: {
  categoryIds?: string[];
}): Promise<ActionResult<SerializedProductListItem[]>> {
  try {
    const repository = new PrismaCatalogRepository(prisma);
    const products = await listProductsUseCase({
      repository,
      filters: {
        isActive: true,
        categoryIds: params.categoryIds,
      },
    });
    return { data: products.map(serializeProductListItem), error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function searchProductsAction(
  query: string,
): Promise<ActionResult<SerializedProductListItem[]>> {
  try {
    const repository = new PrismaCatalogRepository(prisma);
    const products = await searchProductsUseCase({ repository, query });
    return { data: products.map(serializeProductListItem), error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function getProductBySlugAction(
  slug: string,
): Promise<ActionResult<SerializedProductDetail | null>> {
  try {
    const repository = new PrismaCatalogRepository(prisma);
    const product = await getProductBySlugUseCase({ repository, slug });
    if (!product) return { data: null, error: null };
    return { data: serializeProductDetail(product), error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function getStoreConfigAction(): Promise<
  ActionResult<StoreConfigRecord>
> {
  try {
    const repository = new PrismaStoreConfigRepository(prisma);
    const config = await getStoreConfigUseCase({ repository });
    return { data: config, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function getProductByIdAction(
  id: string,
): Promise<ActionResult<SerializedInternalProductDetail | null>> {
  try {
    const repository = new PrismaCatalogRepository(prisma);
    const product = await repository.findById(id);
    if (!product) return { data: null, error: null };
    return { data: serializeInternalProductDetail(product), error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function listActiveCategoriesAction(): Promise<
  ActionResult<CategoryRecord[]>
> {
  try {
    const repository = new PrismaCategoryRepository(prisma);
    const categories = await repository.listActive();
    return { data: categories, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function listAllCategoriesAction(): Promise<
  ActionResult<CategoryRecord[]>
> {
  try {
    const repository = new PrismaCategoryRepository(prisma);
    const categories = await repository.listAll();
    return { data: categories, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}