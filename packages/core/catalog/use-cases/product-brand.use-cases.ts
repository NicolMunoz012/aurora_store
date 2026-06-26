// =============================================================================
// @aurora/core/catalog — use cases for ProductBrand
// =============================================================================

import type { ProductBrandRecord, CreateProductBrandData, UpdateProductBrandData } from "@aurora/shared";
import { AuroraError } from "@aurora/shared";
import type { IProductBrandRepository } from "../repositories/product-brand.repository.interface";

/** Genera un slug a partir de un nombre (ASCII-safe, URL-friendly). */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Genera un slug único añadiendo sufijos numéricos si hay colisiones. */
async function generateUniqueSlug(
  base: string,
  repo: IProductBrandRepository,
): Promise<string> {
  let slug = slugify(base);
  let attempt = 0;
  while (await repo.slugExists(slug)) {
    attempt++;
    slug = `${slugify(base)}-${attempt}`;
  }
  return slug;
}

// ─── Create ────────────────────────────────────────────────────────────────────

export async function createProductBrandUseCase(params: {
  repository: IProductBrandRepository;
  data: CreateProductBrandData;
}): Promise<ProductBrandRecord> {
  const { repository, data } = params;

  const name = data.name.trim();
  if (!name) {
    throw new AuroraError("VALIDATION_ERROR", "El nombre de la marca es obligatorio.");
  }
  if (name.length > 80) {
    throw new AuroraError("VALIDATION_ERROR", "El nombre no puede exceder 80 caracteres.");
  }

  const exists = await repository.nameExists(name);
  if (exists) {
    throw new AuroraError("VALIDATION_ERROR", `Ya existe una marca con el nombre "${name}".`);
  }

  const slug = await generateUniqueSlug(name, repository);
  return repository.create({ name, slug });
}

// ─── Update ────────────────────────────────────────────────────────────────────

export async function updateProductBrandUseCase(params: {
  repository: IProductBrandRepository;
  id: string;
  data: UpdateProductBrandData;
}): Promise<ProductBrandRecord> {
  const { repository, id, data } = params;

  const existing = await repository.findById(id);
  if (!existing) {
    throw new AuroraError("NOT_FOUND", "Marca no encontrada.");
  }

  if (data.name !== undefined) {
    const name = data.name.trim();
    if (!name) throw new AuroraError("VALIDATION_ERROR", "El nombre es obligatorio.");
    if (name.length > 80) throw new AuroraError("VALIDATION_ERROR", "El nombre no puede exceder 80 caracteres.");

    const exists = await repository.nameExists(name, id);
    if (exists) {
      throw new AuroraError("VALIDATION_ERROR", `Ya existe una marca con el nombre "${name}".`);
    }
    data.name = name;
  }

  return repository.update(id, data);
}

// ─── Toggle active ─────────────────────────────────────────────────────────────

export async function toggleProductBrandActiveUseCase(params: {
  repository: IProductBrandRepository;
  id: string;
  isActive: boolean;
}): Promise<ProductBrandRecord> {
  const { repository, id, isActive } = params;

  const existing = await repository.findById(id);
  if (!existing) {
    throw new AuroraError("NOT_FOUND", "Marca no encontrada.");
  }

  return repository.update(id, { isActive });
}

// ─── Delete ────────────────────────────────────────────────────────────────────

export async function deleteProductBrandUseCase(params: {
  repository: IProductBrandRepository;
  id: string;
}): Promise<void> {
  const { repository, id } = params;

  const existing = await repository.findById(id);
  if (!existing) {
    throw new AuroraError("NOT_FOUND", "Marca no encontrada.");
  }

  const productCount = await repository.countProducts(id);
  if (productCount > 0) {
    throw new AuroraError(
      "CONFLICT",
      `No se puede eliminar la marca "${existing.name}" porque tiene ${productCount} producto${productCount !== 1 ? "s" : ""} asociado${productCount !== 1 ? "s" : ""}. Desactívala o reasigna los productos primero.`,
    );
  }

  await repository.delete(id);
}
