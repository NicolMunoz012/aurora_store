// =============================================================================
// @aurora/core/catalog — CategoryService
// Lógica de dominio reutilizable para categorías del catálogo.
// Encapsula generación de slugs únicos y conteo de productos activos (Req 4.10).
// =============================================================================

import { generateUniqueSlug } from "../../shared/slug-generator.js";
import type { ICategoryRepository } from "../repositories/category.repository.interface.js";

export class CategoryService {
  private readonly repository: ICategoryRepository;

  constructor(repository: ICategoryRepository) {
    this.repository = repository;
  }

  /**
   * Generates a unique slug for a category name.
   * Uses the repository's slugExists method as the existence checker.
   */
  async generateCategorySlug(name: string): Promise<string> {
    return generateUniqueSlug(name, (slug) => this.repository.slugExists(slug));
  }

  /**
   * Returns the count of active products in a category.
   * Used for warning before deactivating a category (Req 4.10).
   */
  async getActiveProductCount(categoryId: string): Promise<number> {
    return this.repository.countActiveProductsInCategory(categoryId);
  }
}
