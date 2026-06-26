// =============================================================================
// lib/validations/schemas.ts
// Centralized Zod validation schemas for Colombian e-commerce
// Production-ready validation for frontend and backend
// =============================================================================

import { z } from "zod";
import { getAllDepartmentNames, validateMunicipality } from "./colombia-locations";
import { COLOMBIAN_STREET_TYPES } from "./street-types";

// ─── Name Validation ─────────────────────────────────────────────────────────
// Allows: letters, accents, ñ, spaces, apostrophes, hyphens
// Rejects: numbers, special symbols
const NAME_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ'\s-]+$/;

export const fullNameSchema = z
  .string()
  .min(1, "El nombre completo es obligatorio")
  .min(2, "El nombre debe tener al menos 2 caracteres")
  .max(100, "El nombre no puede exceder 100 caracteres")
  .trim()
  .refine((val) => NAME_REGEX.test(val), {
    message: "El nombre no puede contener números ni símbolos especiales",
  })
  .refine((val) => val.split(/\s+/).length >= 2, {
    message: "Ingresa tu nombre y apellido",
  });

// ─── Colombian Phone Validation ──────────────────────────────────────────────
// Format: exactly 10 digits, typically starts with 3 (mobile)
export const colombianPhoneSchema = z
  .string()
  .min(1, "El teléfono es obligatorio")
  .refine((val) => /^\d{10}$/.test(val), {
    message: "Ingresa un número celular colombiano válido (10 dígitos)",
  })
  .refine((val) => val.startsWith("3"), {
    message: "El número debe iniciar con 3 (celular colombiano)",
  });

// ─── Email Validation ────────────────────────────────────────────────────────
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Ingresa un correo electrónico válido")
  .max(255, "El correo es demasiado largo");

export const optionalEmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .optional()
  .refine(
    (val) => !val || z.string().email().safeParse(val).success,
    "Ingresa un correo electrónico válido"
  );

// ─── Department & Municipality Validation ────────────────────────────────────
export const departmentSchema = z
  .string()
  .min(1, "El departamento es obligatorio")
  .refine((val) => getAllDepartmentNames().includes(val), {
    message: "Selecciona un departamento válido",
  });

export const municipalitySchema = (department: string) =>
  z.string().min(1, "El municipio es obligatorio").refine(
    (val) => {
      if (!department) return true; // Skip if department not selected yet
      return validateMunicipality(department, val);
    },
    {
      message: "Selecciona un municipio válido para este departamento",
    }
  );

// ─── Address Validation ──────────────────────────────────────────────────────
export const streetTypeSchema = z
  .string()
  .min(1, "Selecciona el tipo de vía")
  .refine((val) => COLOMBIAN_STREET_TYPES.some((st) => st.value === val), {
    message: "Tipo de vía inválido",
  });

export const addressNumberSchema = z
  .string()
  .min(1, "Este campo es obligatorio")
  .max(20, "Máximo 20 caracteres")
  .refine((val) => /^[0-9\s-]+$/.test(val), {
    message: "Solo números, espacios y guiones",
  });

export const addressComplementSchema = z
  .string()
  .max(100, "Máximo 100 caracteres")
  .optional();

export const neighborhoodSchema = z
  .string()
  .max(100, "Máximo 100 caracteres")
  .optional();

// ─── Checkout Step 1: Personal Data ──────────────────────────────────────────
export const checkoutStep1Schema = z.object({
  fullName: fullNameSchema,
  phone: colombianPhoneSchema,
  email: optionalEmailSchema,
});

export type CheckoutStep1Data = z.infer<typeof checkoutStep1Schema>;

// ─── Checkout Step 2: Delivery (Home Delivery) ───────────────────────────────
export const checkoutStep2HomeDeliverySchema = z.object({
  deliveryMethod: z.literal("HOME_DELIVERY"),
  department: departmentSchema,
  municipality: z.string().min(1, "El municipio es obligatorio"),
  streetType: streetTypeSchema,
  primaryNumber: addressNumberSchema,
  secondaryNumber: addressNumberSchema,
  complement: addressComplementSchema,
  neighborhood: neighborhoodSchema,
});

// ─── Checkout Step 2: Delivery (Store Pickup) ────────────────────────────────
export const checkoutStep2StorePickupSchema = z.object({
  deliveryMethod: z.literal("STORE_PICKUP"),
});

// Combined Step 2 schema
export const checkoutStep2Schema = z.discriminatedUnion("deliveryMethod", [
  checkoutStep2HomeDeliverySchema,
  checkoutStep2StorePickupSchema,
]);

export type CheckoutStep2Data = z.infer<typeof checkoutStep2Schema>;

// ─── Checkout Step 3: Confirmation ───────────────────────────────────────────
export const checkoutStep3Schema = z.object({
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: "Debes aceptar los términos y condiciones" }),
  }),
});

export type CheckoutStep3Data = z.infer<typeof checkoutStep3Schema>;

// ─── Complete Checkout Schema ────────────────────────────────────────────────
export const completeCheckoutSchema = checkoutStep1Schema
  .and(checkoutStep2Schema)
  .and(checkoutStep3Schema);

export type CompleteCheckoutData = z.infer<typeof completeCheckoutSchema>;

// ─── Saved Address Schema ─────────────────────────────────────────────────────
export const savedAddressSchema = z.object({
  addressName: z.string().min(1, "El nombre de la dirección es obligatorio").max(50),
  department: departmentSchema,
  municipality: z.string().min(1, "El municipio es obligatorio"),
  streetType: streetTypeSchema,
  primaryNumber: addressNumberSchema,
  secondaryNumber: addressNumberSchema,
  complement: addressComplementSchema,
  neighborhood: neighborhoodSchema,
});

export type SavedAddressData = z.infer<typeof savedAddressSchema>;

// ─── Progressive Registration Schema ──────────────────────────────────────────
export const progressiveRegistrationSchema = z.object({
  name: fullNameSchema,
  email: emailSchema,
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: "Debes aceptar los términos y condiciones" }),
  }),
});

export type ProgressiveRegistrationData = z.infer<typeof progressiveRegistrationSchema>;
