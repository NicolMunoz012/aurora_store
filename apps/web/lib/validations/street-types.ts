// =============================================================================
// lib/validations/street-types.ts
// Colombian street type nomenclature for address formatting
// =============================================================================

export interface StreetType {
  value: string;
  label: string;
  abbreviation: string;
}

export const COLOMBIAN_STREET_TYPES: StreetType[] = [
  { value: "CALLE", label: "Calle", abbreviation: "CL" },
  { value: "CARRERA", label: "Carrera", abbreviation: "CRA" },
  { value: "AVENIDA", label: "Avenida", abbreviation: "AV" },
  { value: "TRANSVERSAL", label: "Transversal", abbreviation: "TV" },
  { value: "DIAGONAL", label: "Diagonal", abbreviation: "DG" },
  { value: "CIRCULAR", label: "Circular", abbreviation: "CIR" },
  { value: "MANZANA", label: "Manzana", abbreviation: "MZ" },
  { value: "AUTOPISTA", label: "Autopista", abbreviation: "AUT" },
  { value: "KILOMETRO", label: "Kilómetro", abbreviation: "KM" },
];

export interface ParsedAddress {
  streetType: string;
  primaryNumber: string;
  secondaryNumber: string;
  complement?: string;
}

/**
 * Formats a structured address into Colombian nomenclature
 * Example: { streetType: "CARRERA", primaryNumber: "12", secondaryNumber: "21-2" }
 * Returns: "CRA 12 # 21-2"
 */
export function formatColombianAddress(parsed: ParsedAddress): string {
  const streetType = COLOMBIAN_STREET_TYPES.find((st) => st.value === parsed.streetType);
  const abbr = streetType?.abbreviation ?? parsed.streetType;
  
  const base = `${abbr} ${parsed.primaryNumber} # ${parsed.secondaryNumber}`;
  
  return parsed.complement ? `${base} ${parsed.complement}` : base;
}

/**
 * Validates that a string only contains numbers, spaces, and hyphens
 * Used for address number validation
 */
export function isValidAddressNumber(value: string): boolean {
  return /^[0-9\s-]+$/.test(value);
}
