// =============================================================================
// @aurora/core/catalog — PrismaCatalogRepository
// Implementación Prisma del repositorio de productos del catálogo (Req 1.6, 11.3).
// Encapsula todas las operaciones de acceso a datos de producto,
// mapeando resultados Prisma a tipos de dominio y capturando errores Prisma
// para re-lanzarlos como AuroraError.
// =============================================================================

import type { PrismaClient } from "@aurora/database";
import type {
  ProductListItem,
  InternalProductDetail,
  ProductImageRecord,
  ProductFilters,
  CreateProductData,
  UpdateProductData,
  AddImageData,
} from "@aurora/shared";
import { AuroraError } from "@aurora/shared";
import { Decimal } from "decimal.js";
import type { ICatalogRepository } from "./catalog.repository.interface";

// ─── Helper mappers ───────────────────────────────────────────────────────────

/**
 * Mapea un producto Prisma con categoría e imagen principal a ProductListItem.
 */
function mapToProductListItem(product: {
  id: string;
  name: string;
  slug: string;
  retailPrice: unknown;
  stock: number;
  isActive: boolean;
  category: { id: string; name: string; slug: string };
  images: Array<{ url: string; altText: string | null; displayOrder: number }>;
}): ProductListItem {
  const mainImage = product.images.length > 0
    ? product.images.sort((a, b) => a.displayOrder - b.displayOrder)[0]
    : null;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    retailPrice: new Decimal(product.retailPrice!.toString()),
    stock: product.stock,
    isActive: product.isActive,
    mainImageUrl: mainImage?.url ?? "",
    mainImageAlt: mainImage?.altText ?? null,
    category: {
      id: product.category.id,
      name: product.category.name,
      slug: product.category.slug,
    },
  };
}

/**
 * Mapea un producto Prisma completo a InternalProductDetail.
 * Incluye wholesalePrice, description, minWholesaleQty, lowStockAlert y todas las imágenes.
 */
function mapToInternalProductDetail(product: {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  retailPrice: unknown;
  wholesalePrice: unknown;
  stock: number;
  lowStockAlert: number;
  minWholesaleQty: number | null;
  isActive: boolean;
  category: { id: string; name: string; slug: string };
  images: Array<{
    id: string;
    productId: string;
    url: string;
    displayOrder: number;
    altText: string | null;
    createdAt: Date;
  }>;
}): InternalProductDetail {
  const mainImage = product.images.length > 0
    ? [...product.images].sort((a, b) => a.displayOrder - b.displayOrder)[0]
    : null;

  const images: ProductImageRecord[] = product.images.map((img) => ({
    id: img.id,
    productId: img.productId,
    url: img.url,
    displayOrder: img.displayOrder,
    altText: img.altText,
    createdAt: img.createdAt,
  }));

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    retailPrice: new Decimal(product.retailPrice!.toString()),
    stock: product.stock,
    isActive: product.isActive,
    mainImageUrl: mainImage?.url ?? "",
    mainImageAlt: mainImage?.altText ?? null,
    category: {
      id: product.category.id,
      name: product.category.name,
      slug: product.category.slug,
    },
    description: product.description,
    minWholesaleQty: product.minWholesaleQty,
    lowStockAlert: product.lowStockAlert,
    images,
    wholesalePrice: new Decimal(product.wholesalePrice!.toString()),
  };
}

// ─── Prisma includes reutilizables ───────────────────────────────────────────

const productListInclude = {
  category: { select: { id: true, name: true, slug: true } },
  images: {
    select: { url: true, altText: true, displayOrder: true },
    orderBy: { displayOrder: "asc" as const },
    take: 1,
  },
} as const;

const productDetailInclude = {
  category: { select: { id: true, name: true, slug: true } },
  images: {
    select: {
      id: true,
      productId: true,
      url: true,
      displayOrder: true,
      altText: true,
      createdAt: true,
    },
    orderBy: { displayOrder: "asc" as const },
  },
} as const;

// ─── Repository Implementation ──────────────────────────────────────────────

export class PrismaCatalogRepository implements ICatalogRepository {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async listActiveProducts(filters: ProductFilters): Promise<ProductListItem[]> {
    try {
      const where: Record<string, unknown> = {
        isActive: true,
        category: { isActive: true },
      };

      if (filters.categoryIds && filters.categoryIds.length > 0) {
        where.categoryId = { in: filters.categoryIds };
      }

      const products = await this.prisma.product.findMany({
        where,
        include: productListInclude,
        orderBy: { name: "asc" },
      });

      return products.map(mapToProductListItem);
    } catch (error) {
      throw this.handlePrismaError(error, "listActiveProducts");
    }
  }

  async findBySlug(slug: string): Promise<InternalProductDetail | null> {
    try {
      const product = await this.prisma.product.findUnique({
        where: { slug },
        include: productDetailInclude,
      });

      return product ? mapToInternalProductDetail(product) : null;
    } catch (error) {
      throw this.handlePrismaError(error, "findBySlug");
    }
  }

  async findById(id: string): Promise<InternalProductDetail | null> {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id },
        include: productDetailInclude,
      });

      return product ? mapToInternalProductDetail(product) : null;
    } catch (error) {
      throw this.handlePrismaError(error, "findById");
    }
  }

  async searchProducts(query: string): Promise<ProductListItem[]> {
    try {
      const products = await this.prisma.product.findMany({
        where: {
          isActive: true,
          category: { isActive: true },
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        include: productListInclude,
        orderBy: { name: "asc" },
      });

      return products.map(mapToProductListItem);
    } catch (error) {
      throw this.handlePrismaError(error, "searchProducts");
    }
  }

  async createProduct(
    data: CreateProductData & { slug: string },
  ): Promise<InternalProductDetail> {
    try {
      const product = await this.prisma.product.create({
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description ?? null,
          retailPrice: data.retailPrice.toString(),
          wholesalePrice: data.wholesalePrice.toString(),
          stock: data.stock ?? 0,
          lowStockAlert: data.lowStockAlert ?? 0,
          minWholesaleQty: data.minWholesaleQty ?? null,
          categoryId: data.categoryId,
          images: {
            create: data.images.map((img, index) => ({
              url: img.url,
              displayOrder: img.displayOrder ?? index,
              altText: img.altText ?? null,
            })),
          },
        },
        include: productDetailInclude,
      });

      return mapToInternalProductDetail(product);
    } catch (error) {
      throw this.handlePrismaError(error, "createProduct");
    }
  }

  async updateProduct(
    id: string,
    data: UpdateProductData,
  ): Promise<InternalProductDetail> {
    try {
      const updateData: Record<string, unknown> = {};

      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.retailPrice !== undefined) updateData.retailPrice = data.retailPrice.toString();
      if (data.wholesalePrice !== undefined) updateData.wholesalePrice = data.wholesalePrice.toString();
      if (data.stock !== undefined) updateData.stock = data.stock;
      if (data.lowStockAlert !== undefined) updateData.lowStockAlert = data.lowStockAlert;
      if (data.minWholesaleQty !== undefined) updateData.minWholesaleQty = data.minWholesaleQty;
      if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
      if (data.isActive !== undefined) updateData.isActive = data.isActive;

      const product = await this.prisma.product.update({
        where: { id },
        data: updateData,
        include: productDetailInclude,
      });

      return mapToInternalProductDetail(product);
    } catch (error) {
      throw this.handlePrismaError(error, "updateProduct");
    }
  }

  async setActiveStatus(id: string, isActive: boolean): Promise<void> {
    try {
      await this.prisma.product.update({
        where: { id },
        data: { isActive },
      });
    } catch (error) {
      throw this.handlePrismaError(error, "setActiveStatus");
    }
  }

  async countImagesByProductId(productId: string): Promise<number> {
    try {
      return await this.prisma.productImage.count({
        where: { productId },
      });
    } catch (error) {
      throw this.handlePrismaError(error, "countImagesByProductId");
    }
  }

  async addImage(
    productId: string,
    data: AddImageData,
  ): Promise<ProductImageRecord> {
    try {
      const image = await this.prisma.productImage.create({
        data: {
          productId,
          url: data.url,
          displayOrder: data.displayOrder ?? 0,
          altText: data.altText ?? null,
        },
      });

      return {
        id: image.id,
        productId: image.productId,
        url: image.url,
        displayOrder: image.displayOrder,
        altText: image.altText,
        createdAt: image.createdAt,
      };
    } catch (error) {
      throw this.handlePrismaError(error, "addImage");
    }
  }

  async removeImage(imageId: string): Promise<void> {
    try {
      await this.prisma.productImage.delete({
        where: { id: imageId },
      });
    } catch (error) {
      throw this.handlePrismaError(error, "removeImage");
    }
  }

  async slugExists(slug: string): Promise<boolean> {
    try {
      const product = await this.prisma.product.findFirst({
        where: { slug },
        select: { id: true },
      });

      return product !== null;
    } catch (error) {
      throw this.handlePrismaError(error, "slugExists");
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
