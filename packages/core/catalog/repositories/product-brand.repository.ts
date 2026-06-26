// =============================================================================
// @aurora/core/catalog — PrismaProductBrandRepository
// Implementación Prisma del repositorio de marcas de productos.
// =============================================================================

import type { PrismaClient } from "@aurora/database";
import type {
  ProductBrandRecord,
  CreateProductBrandData,
  UpdateProductBrandData,
} from "@aurora/shared";
import { AuroraError } from "@aurora/shared";
import type { IProductBrandRepository } from "./product-brand.repository.interface";

function mapToBrandRecord(brand: {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}): ProductBrandRecord {
  return {
    id: brand.id,
    name: brand.name,
    slug: brand.slug,
    isActive: brand.isActive,
    createdAt: brand.createdAt,
    updatedAt: brand.updatedAt,
  };
}

export class PrismaProductBrandRepository implements IProductBrandRepository {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async listAll(): Promise<ProductBrandRecord[]> {
    try {
      const brands = await this.prisma.productBrand.findMany({
        orderBy: { name: "asc" },
      });
      return brands.map(mapToBrandRecord);
    } catch (error) {
      throw this.handleError(error, "listAll");
    }
  }

  async listActive(): Promise<ProductBrandRecord[]> {
    try {
      const brands = await this.prisma.productBrand.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
      });
      return brands.map(mapToBrandRecord);
    } catch (error) {
      throw this.handleError(error, "listActive");
    }
  }

  async findById(id: string): Promise<ProductBrandRecord | null> {
    try {
      const brand = await this.prisma.productBrand.findUnique({ where: { id } });
      return brand ? mapToBrandRecord(brand) : null;
    } catch (error) {
      throw this.handleError(error, "findById");
    }
  }

  async findBySlug(slug: string): Promise<ProductBrandRecord | null> {
    try {
      const brand = await this.prisma.productBrand.findUnique({ where: { slug } });
      return brand ? mapToBrandRecord(brand) : null;
    } catch (error) {
      throw this.handleError(error, "findBySlug");
    }
  }

  async create(
    data: CreateProductBrandData & { slug: string },
  ): Promise<ProductBrandRecord> {
    try {
      const brand = await this.prisma.productBrand.create({
        data: {
          name: data.name.trim(),
          slug: data.slug,
          isActive: true,
        },
      });
      return mapToBrandRecord(brand);
    } catch (error) {
      throw this.handleError(error, "create");
    }
  }

  async update(id: string, data: UpdateProductBrandData): Promise<ProductBrandRecord> {
    try {
      const updateData: Record<string, unknown> = {};
      if (data.name !== undefined) updateData.name = data.name.trim();
      if (data.isActive !== undefined) updateData.isActive = data.isActive;

      const brand = await this.prisma.productBrand.update({
        where: { id },
        data: updateData,
      });
      return mapToBrandRecord(brand);
    } catch (error) {
      throw this.handleError(error, "update");
    }
  }

  async countProducts(brandId: string): Promise<number> {
    try {
      return await this.prisma.product.count({ where: { brandId } });
    } catch (error) {
      throw this.handleError(error, "countProducts");
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.productBrand.delete({ where: { id } });
    } catch (error) {
      throw this.handleError(error, "delete");
    }
  }

  async slugExists(slug: string): Promise<boolean> {
    try {
      const brand = await this.prisma.productBrand.findFirst({
        where: { slug },
        select: { id: true },
      });
      return brand !== null;
    } catch (error) {
      throw this.handleError(error, "slugExists");
    }
  }

  async nameExists(name: string, excludeId?: string): Promise<boolean> {
    try {
      const brand = await this.prisma.productBrand.findFirst({
        where: {
          name: { equals: name.trim(), mode: "insensitive" },
          ...(excludeId ? { id: { not: excludeId } } : {}),
        },
        select: { id: true },
      });
      return brand !== null;
    } catch (error) {
      throw this.handleError(error, "nameExists");
    }
  }

  private handleError(error: unknown, operation: string): AuroraError {
    if (error instanceof AuroraError) return error;

    if (
      error instanceof Error &&
      "code" in error &&
      typeof (error as Record<string, unknown>).code === "string"
    ) {
      const code = (error as Record<string, unknown>).code as string;
      if (code === "P2002") {
        return new AuroraError("REPOSITORY_ERROR", `Duplicate value in ${operation}`);
      }
      if (code === "P2025") {
        return new AuroraError("REPOSITORY_ERROR", `Record not found in ${operation}`);
      }
      return new AuroraError("REPOSITORY_ERROR", `Database error [${code}] in ${operation}`);
    }

    return new AuroraError(
      "REPOSITORY_ERROR",
      `Unexpected error in ${operation}: ${error instanceof Error ? error.message : "Unknown"}`,
    );
  }
}
