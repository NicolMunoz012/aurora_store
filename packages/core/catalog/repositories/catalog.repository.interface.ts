// =============================================================================
// @aurora/core/catalog — ICatalogRepository
// Contrato puro de persistencia para el módulo de catálogo (Req 4.1–4.12).
// Sin dependencias de Prisma ni de ninguna implementación concreta.
// =============================================================================

import type {
  ProductListItem,
  InternalProductDetail,
  ProductImageRecord,
  ProductFilters,
  CreateProductData,
  UpdateProductData,
  AddImageData,
} from "@aurora/shared";

/**
 * Repositorio de productos del catálogo.
 * Define las operaciones de lectura/escritura que los Use Cases
 * del módulo catalog necesitan, sin acoplarse a la capa de infraestructura.
 */
export interface ICatalogRepository {
  /**
   * Lista productos activos aplicando filtros opcionales.
   * Solo retorna productos donde isActive=true AND category.isActive=true.
   */
  listActiveProducts(filters: ProductFilters): Promise<ProductListItem[]>;

  /**
   * Busca un producto por su slug.
   * @returns Detalle interno (con wholesalePrice) o null si no existe.
   */
  findBySlug(slug: string): Promise<InternalProductDetail | null>;

  /**
   * Busca un producto por su ID.
   * @returns Detalle interno (con wholesalePrice) o null si no existe.
   */
  findById(id: string): Promise<InternalProductDetail | null>;

  /**
   * Búsqueda ILIKE sobre nombre y descripción del producto (DT-001).
   * Para MVP sin índice GIN; aceptable con <50 productos.
   */
  searchProducts(query: string): Promise<ProductListItem[]>;

  /**
   * Crea un producto con sus imágenes asociadas.
   * El slug debe ser generado por el use case/service y pasado como parte de data.
   * @returns El producto creado con detalle interno.
   */
  createProduct(
    data: CreateProductData & { slug: string },
  ): Promise<InternalProductDetail>;

  /**
   * Actualiza un producto existente.
   * @returns El producto actualizado con detalle interno.
   */
  updateProduct(
    id: string,
    data: UpdateProductData,
  ): Promise<InternalProductDetail>;

  /**
   * Cambia el estado activo/inactivo de un producto.
   */
  setActiveStatus(id: string, isActive: boolean): Promise<void>;

  /**
   * Cuenta las imágenes asociadas a un producto.
   * Usado para validación de límites (mín 1, máx 5).
   */
  countImagesByProductId(productId: string): Promise<number>;

  /**
   * Agrega una imagen a un producto.
   * @returns El registro de imagen creado.
   */
  addImage(productId: string, data: AddImageData): Promise<ProductImageRecord>;

  /**
   * Elimina una imagen de producto por su ID.
   */
  removeImage(imageId: string): Promise<void>;

  /**
   * Verifies if a product with the given normalized name already exists.
   * Case-insensitive and trim-aware. Optionally excludes a product by ID
   * (used when updating to allow keeping the same name).
   * @param name — raw name (will be trimmed/lowercased internally)
   * @param excludeId — productId to exclude from the check (for updates)
   */
  nameExistsForOther(name: string, excludeId?: string): Promise<boolean>;

  /**
   * Replaces ALL images of a product atomically.
   * Deletes existing images and creates the new set in a single transaction.
   * Preserves displayOrder from the provided array.
   */
  syncImages(productId: string, images: AddImageData[]): Promise<void>;

  /**
   * Verifies if a slug ya existe en la tabla de productos.
   * Usado por generateUniqueSlug como existsFn.
   */
  slugExists(slug: string): Promise<boolean>;
}
