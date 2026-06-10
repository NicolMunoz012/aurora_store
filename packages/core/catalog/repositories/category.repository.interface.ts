// =============================================================================
// @aurora/core/catalog — ICategoryRepository
// Contrato puro de persistencia para categorías del catálogo (Req 4.1–4.12).
// Sin dependencias de Prisma ni de ninguna implementación concreta.
// =============================================================================

import type {
  CategoryRecord,
  CreateCategoryData,
  UpdateCategoryData,
} from "@aurora/shared";

/**
 * Repositorio de categorías.
 * Define las operaciones de lectura/escritura que los Use Cases
 * del módulo catalog necesitan para gestionar categorías.
 */
export interface ICategoryRepository {
  /**
   * Lista todas las categorías (activas e inactivas).
   */
  listAll(): Promise<CategoryRecord[]>;

  /**
   * Lista solo las categorías activas.
   */
  listActive(): Promise<CategoryRecord[]>;

  /**
   * Busca una categoría por su ID.
   * @returns La categoría o null si no existe.
   */
  findById(id: string): Promise<CategoryRecord | null>;

  /**
   * Busca una categoría por su slug.
   * @returns La categoría o null si no existe.
   */
  findBySlug(slug: string): Promise<CategoryRecord | null>;

  /**
   * Cuenta los productos activos en una categoría.
   * Usado para advertencia al desactivar una categoría.
   */
  countActiveProductsInCategory(categoryId: string): Promise<number>;

  /**
   * Crea una categoría.
   * El slug debe ser generado por el use case/service y pasado como parte de data.
   * @returns La categoría creada.
   */
  createCategory(
    data: CreateCategoryData & { slug: string },
  ): Promise<CategoryRecord>;

  /**
   * Actualiza una categoría existente.
   * @returns La categoría actualizada.
   */
  updateCategory(id: string, data: UpdateCategoryData): Promise<CategoryRecord>;

  /**
   * Cambia el estado activo/inactivo de una categoría.
   */
  setActiveStatus(id: string, isActive: boolean): Promise<void>;

  /**
   * Verifica si un slug ya existe en la tabla de categorías.
   * Usado por generateUniqueSlug como existsFn.
   */
  slugExists(slug: string): Promise<boolean>;
}
