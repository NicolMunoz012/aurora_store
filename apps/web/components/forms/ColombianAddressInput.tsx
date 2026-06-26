"use client";
// =============================================================================
// components/forms/ColombianAddressInput.tsx
// Professional Colombian address input with nomenclature builder
// Similar to Falabella/Éxito/Mercado Libre address systems
// =============================================================================

import { useState, useEffect } from "react";
import { COLOMBIAN_STREET_TYPES, formatColombianAddress, type ParsedAddress } from "@/lib/validations/street-types";
import { sanitizeAddressNumber } from "@/lib/validations/utils";

interface ColombianAddressInputProps {
  streetType: string;
  primaryNumber: string;
  secondaryNumber: string;
  complement?: string;
  onStreetTypeChange: (value: string) => void;
  onPrimaryNumberChange: (value: string) => void;
  onSecondaryNumberChange: (value: string) => void;
  onComplementChange?: (value: string) => void;
  errors?: {
    streetType?: string;
    primaryNumber?: string;
    secondaryNumber?: string;
    complement?: string;
  };
  disabled?: boolean;
}

export function ColombianAddressInput({
  streetType,
  primaryNumber,
  secondaryNumber,
  complement = "",
  onStreetTypeChange,
  onPrimaryNumberChange,
  onSecondaryNumberChange,
  onComplementChange,
  errors = {},
  disabled = false,
}: ColombianAddressInputProps) {
  const [preview, setPreview] = useState("");

  // Update preview whenever address parts change
  useEffect(() => {
    if (streetType && primaryNumber && secondaryNumber) {
      const parsed: ParsedAddress = {
        streetType,
        primaryNumber,
        secondaryNumber,
        complement: complement || undefined,
      };
      setPreview(formatColombianAddress(parsed));
    } else {
      setPreview("");
    }
  }, [streetType, primaryNumber, secondaryNumber, complement]);

  const handlePrimaryNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeAddressNumber(e.target.value);
    onPrimaryNumberChange(sanitized);
  };

  const handleSecondaryNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeAddressNumber(e.target.value);
    onSecondaryNumberChange(sanitized);
  };

  return (
    <div className="space-y-4">
      {/* Street Type Selector */}
      <div>
        <label htmlFor="streetType" className="mb-1 block text-sm font-medium text-gray-700">
          Tipo de vía *
        </label>
        <select
          id="streetType"
          value={streetType}
          onChange={(e) => onStreetTypeChange(e.target.value)}
          disabled={disabled}
          className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none ${
            errors.streetType
              ? "border-red-500 focus:border-red-500"
              : "border-gray-200 focus:border-cerise-400"
          } ${disabled ? "bg-gray-50 cursor-not-allowed" : "bg-white"}`}
        >
          <option value="">Selecciona...</option>
          {COLOMBIAN_STREET_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label} ({type.abbreviation})
            </option>
          ))}
        </select>
        {errors.streetType && (
          <p className="mt-1 text-xs text-red-500">{errors.streetType}</p>
        )}
      </div>

      {/* Address Numbers Grid */}
      <div className="grid grid-cols-5 gap-2 items-end">
        {/* Primary Number */}
        <div className="col-span-2">
          <label htmlFor="primaryNumber" className="mb-1 block text-sm font-medium text-gray-700">
            Número *
          </label>
          <input
            id="primaryNumber"
            type="text"
            value={primaryNumber}
            onChange={handlePrimaryNumberChange}
            disabled={disabled}
            placeholder="12"
            maxLength={10}
            className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none ${
              errors.primaryNumber
                ? "border-red-500 focus:border-red-500"
                : "border-gray-200 focus:border-cerise-400"
            } ${disabled ? "bg-gray-50 cursor-not-allowed" : "bg-white"}`}
          />
          {errors.primaryNumber && (
            <p className="mt-1 text-xs text-red-500">{errors.primaryNumber}</p>
          )}
        </div>

        {/* Separator */}
        <div className="flex items-center justify-center pb-2">
          <span className="text-xl font-semibold text-gray-400">#</span>
        </div>

        {/* Secondary Number */}
        <div className="col-span-2">
          <label htmlFor="secondaryNumber" className="mb-1 block text-sm font-medium text-gray-700">
            Número *
          </label>
          <input
            id="secondaryNumber"
            type="text"
            value={secondaryNumber}
            onChange={handleSecondaryNumberChange}
            disabled={disabled}
            placeholder="21-2"
            maxLength={10}
            className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none ${
              errors.secondaryNumber
                ? "border-red-500 focus:border-red-500"
                : "border-gray-200 focus:border-cerise-400"
            } ${disabled ? "bg-gray-50 cursor-not-allowed" : "bg-white"}`}
          />
          {errors.secondaryNumber && (
            <p className="mt-1 text-xs text-red-500">{errors.secondaryNumber}</p>
          )}
        </div>
      </div>

      {/* Complement */}
      {onComplementChange && (
        <div>
          <label htmlFor="complement" className="mb-1 block text-sm font-medium text-gray-700">
            Complemento (opcional)
          </label>
          <input
            id="complement"
            type="text"
            value={complement}
            onChange={(e) => onComplementChange(e.target.value)}
            disabled={disabled}
            placeholder="Apto 302, Torre B, Interior 2, etc."
            maxLength={100}
            className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none ${
              errors.complement
                ? "border-red-500 focus:border-red-500"
                : "border-gray-200 focus:border-cerise-400"
            } ${disabled ? "bg-gray-50 cursor-not-allowed" : "bg-white"}`}
          />
          <p className="mt-1 text-xs text-gray-500">
            Ej: Apto 302, Torre B, Interior 2, Casa 5, Oficina 201
          </p>
          {errors.complement && (
            <p className="mt-1 text-xs text-red-500">{errors.complement}</p>
          )}
        </div>
      )}

      {/* Live Preview */}
      {preview && (
        <div className="rounded-lg bg-cerise-50 px-4 py-3 border border-cerise-200">
          <p className="text-xs font-medium text-cerise-700 mb-1">Vista previa de la dirección:</p>
          <p className="text-sm font-semibold text-cerise-900">{preview}</p>
        </div>
      )}

      {/* Helper text */}
      <p className="text-xs text-gray-500">
        * Ejemplo: Carrera 12 # 21-2 Apto 302
      </p>
    </div>
  );
}
