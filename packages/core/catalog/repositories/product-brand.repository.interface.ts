// =============================================================================
// @aurora/core/catalog — IProductBrandRepository
// Contrato puro de persistencia para marcas de productos.
// =============================================================================

import type { ProductBrandRecord, CreateProductBrandData, UpdateProductBrandData } from "@aurora/shared";

export interface IProductBrandRepository {
  /** Lista todas las marcas ordenadas por nombre. */
  listAll(): Promise<ProductBrandRecord[]>;

  /** Lista solo marcas activas. */
  listActive(): Promise<ProductBrandRecord[]>;

  /** Busca una marca por ID. */
  findById(id: string): Promise<ProductBrandRecord | null>;

  /** Busca una marca por slug. */
  findBySlug(slug: string): Promise<ProductBrandRecord | null>;

  /** Crea una marca nueva. */
  create(data: CreateProductBrandData & { slug: string }): Promise<ProductBrandRecord>;

  /** Actualiza nombre y/o estado de una marca. */
  update(id: string, data: UpdateProductBrandData): Promise<ProductBrandRecord>;

  /** Cuenta cuántos productos tienen esta marca asignada. */
  countProducts(brandId: string): Promise<number>;

  /** Elimina físicamente una marca. Solo ejecutar después de validar countProducts === 0. */
  delete(id: string): Promise<void>;

  /** Verifica si el slug ya existe. */
  slugExists(slug: string): Promise<boolean>;

  /** Verifica si el nombre ya existe (case-insensitive). */
  nameExists(name: string, excludeId?: string): Promise<boolean>;
}
