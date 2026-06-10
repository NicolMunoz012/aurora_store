// =============================================================================
// @aurora/core/catalog — CatalogService
// Lógica de dominio reutilizable para productos del catálogo.
// Encapsula validación de imágenes y generación de slugs únicos (Req 4.5, 4.6).
// =============================================================================

import { ProductRequiresImageError } from "@aurora/shared";
import { generateUniqueSlug } from "../../shared/slug-generator.js";
import type { ICatalogRepository } from "../repositories/catalog.repository.interface.js";

export class CatalogService {
  private readonly repository: ICatalogRepository;

  constructor(repository: ICatalogRepository) {
    this.repository = repository;
  }

  /**
   * Generates a unique slug for a product name.
   * Uses the repository's slugExists method as the existence checker.
   */
  async generateProductSlug(name: string): Promise<string> {
    return generateUniqueSlug(name, (slug) => this.repository.slugExists(slug));
  }

  /**
   * Validates that the image count meets the minimum requirement.
   * @throws ProductRequiresImageError if count < 1
   */
  validateMinimumImages(imageCount: number): void {
    if (imageCount < 1) {
      throw new ProductRequiresImageError();
    }
  }
}
