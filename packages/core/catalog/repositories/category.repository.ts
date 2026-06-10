// =============================================================================
// @aurora/core/catalog — PrismaCategoryRepository
// Implementación Prisma del repositorio de categorías del catálogo (Req 1.6, 11.3).
// Encapsula todas las operaciones de acceso a datos de categoría,
// mapeando resultados Prisma a tipos de dominio y capturando errores Prisma
// para re-lanzarlos como AuroraError.
// =============================================================================

import type { PrismaClient } from "@aurora/database/generated/prisma/client.js";
import type {
  CategoryRecord,
  CreateCategoryData,
  UpdateCategoryData,
} from "@aurora/shared";
import { AuroraError } from "@aurora/shared";
import type { ICategoryRepository } from "./category.repository.interface.js";

// ─── Helper mapper ────────────────────────────────────────────────────────────

/**
 * Mapea un registro de categoría Prisma al tipo de dominio CategoryRecord.
 */
function mapToCategoryRecord(category: {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}): CategoryRecord {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    isActive: category.isActive,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}

// ─── Repository Implementation ──────────────────────────────────────────────

export class PrismaCategoryRepository implements ICategoryRepository {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async listAll(): Promise<CategoryRecord[]> {
    try {
      const categories = await this.prisma.category.findMany({
        orderBy: { name: "asc" },
      });

      return categories.map(mapToCategoryRecord);
    } catch (error) {
      throw this.handlePrismaError(error, "listAll");
    }
  }

  async listActive(): Promise<CategoryRecord[]> {
    try {
      const categories = await this.prisma.category.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
      });

      return categories.map(mapToCategoryRecord);
    } catch (error) {
      throw this.handlePrismaError(error, "listActive");
    }
  }

  async findById(id: string): Promise<CategoryRecord | null> {
    try {
      const category = await this.prisma.category.findUnique({
        where: { id },
      });

      return category ? mapToCategoryRecord(category) : null;
    } catch (error) {
      throw this.handlePrismaError(error, "findById");
    }
  }

  async findBySlug(slug: string): Promise<CategoryRecord | null> {
    try {
      const category = await this.prisma.category.findUnique({
        where: { slug },
      });

      return category ? mapToCategoryRecord(category) : null;
    } catch (error) {
      throw this.handlePrismaError(error, "findBySlug");
    }
  }

  async countActiveProductsInCategory(categoryId: string): Promise<number> {
    try {
      return await this.prisma.product.count({
        where: {
          categoryId,
          isActive: true,
        },
      });
    } catch (error) {
      throw this.handlePrismaError(error, "countActiveProductsInCategory");
    }
  }

  async createCategory(
    data: CreateCategoryData & { slug: string },
  ): Promise<CategoryRecord> {
    try {
      const category = await this.prisma.category.create({
        data: {
          name: data.name,
          slug: data.slug,
        },
      });

      return mapToCategoryRecord(category);
    } catch (error) {
      throw this.handlePrismaError(error, "createCategory");
    }
  }

  async updateCategory(
    id: string,
    data: UpdateCategoryData,
  ): Promise<CategoryRecord> {
    try {
      const updateData: Record<string, unknown> = {};

      if (data.name !== undefined) updateData.name = data.name;
      if (data.isActive !== undefined) updateData.isActive = data.isActive;

      const category = await this.prisma.category.update({
        where: { id },
        data: updateData,
      });

      return mapToCategoryRecord(category);
    } catch (error) {
      throw this.handlePrismaError(error, "updateCategory");
    }
  }

  async setActiveStatus(id: string, isActive: boolean): Promise<void> {
    try {
      await this.prisma.category.update({
        where: { id },
        data: { isActive },
      });
    } catch (error) {
      throw this.handlePrismaError(error, "setActiveStatus");
    }
  }

  async slugExists(slug: string): Promise<boolean> {
    try {
      const category = await this.prisma.category.findFirst({
        where: { slug },
        select: { id: true },
      });

      return category !== null;
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
