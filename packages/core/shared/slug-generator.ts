/**
 * Generador de slugs URL-safe para productos y categorías.
 * DA-006: El slug se genera al crear el registro y NO debe cambiar tras publicación.
 */

/**
 * Genera un slug URL-safe a partir de un nombre.
 * - Normaliza Unicode (NFD) y elimina diacríticos/acentos
 * - Reemplaza caracteres no alfanuméricos con guiones
 * - Colapsa múltiples guiones consecutivos en uno
 * - Elimina guiones iniciales y finales
 * - Convierte a lowercase
 */
export function generateBaseSlug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // non-alphanumeric → hyphen
    .replace(/-{2,}/g, "-") // collapse multiple hyphens
    .replace(/^-|-$/g, "") // trim leading/trailing hyphens
}

/**
 * Genera un slug único consultando `existsFn` para verificar disponibilidad.
 * Si el slug base ya existe, intenta con sufijos `-2`, `-3`, etc.
 */
export async function generateUniqueSlug(
  name: string,
  existsFn: (slug: string) => Promise<boolean>
): Promise<string> {
  const baseSlug = generateBaseSlug(name)

  if (!(await existsFn(baseSlug))) {
    return baseSlug
  }

  let counter = 2
  while (true) {
    const candidate = `${baseSlug}-${counter}`
    if (!(await existsFn(candidate))) {
      return candidate
    }
    counter++
  }
}
