"use client";
// =============================================================================
// components/checkout/CheckoutFlow.tsx
// Multi-step checkout with full Colombian validation (Steps 1 → 2 → 3)
// =============================================================================

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { SerializedResolvedCart } from "@/lib/serializers";
import { validateStockAction, createOrderAction } from "@/lib/actions/checkout.actions";
import { registerAction } from "@/lib/actions/auth.actions";
import type { DeliveryMethod } from "@aurora/shared";

import { checkoutStep1Schema, checkoutStep2HomeDeliverySchema } from "@/lib/validations/schemas";
import { sanitizePhone, sanitizeName } from "@/lib/validations/utils";
import { COLOMBIAN_DEPARTMENTS, getMunicipalitiesForDepartment } from "@/lib/validations/colombia-locations";
import { ColombianAddressInput } from "@/components/forms/ColombianAddressInput";
import { ValidatedInput } from "@/components/forms/ValidatedInput";
import { formatColombianAddress } from "@/lib/validations/street-types";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface SavedAddress {
  id: string;
  addressName: string;
  department: string;
  municipality: string;
  address: string;
  neighborhood: string | null;
}

interface SerializedStoreConfig {
  storePhysicalAddress: string;
  wholesaleThreshold: string;
  whatsappNumber: string;
  anonOrderExpiryDays: number;
  registeredOrderExpiryDays: number;
}

interface CheckoutFlowProps {
  cart: SerializedResolvedCart;
  storeConfig: SerializedStoreConfig | null;
  isAuthenticated: boolean;
  prefill: { name: string; phone: string; email: string };
  savedAddresses: SavedAddress[];
  sessionId: string;
  userId: string | null;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatCOP(value: string): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(parseFloat(value));
}

type Step1Errors = Partial<Record<"fullName" | "phone" | "email", string>>;
type Step2Errors = Partial<Record<"department" | "municipality" | "streetType" | "primaryNumber" | "secondaryNumber" | "complement" | "neighborhood", string>>;

// ─── Component ─────────────────────────────────────────────────────────────────

export function CheckoutFlow({
  cart,
  storeConfig,
  isAuthenticated,
  prefill,
  savedAddresses,
  sessionId,
  userId,
}: CheckoutFlowProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // ── Step 1 state ──────────────────────────────────────────────────────────
  const [fullName, setFullName] = useState(prefill.name);
  const [phone, setPhone] = useState(prefill.phone);
  const [email, setEmail] = useState(prefill.email);
  const [step1Errors, setStep1Errors] = useState<Step1Errors>({});

  // ── Step 2 state ──────────────────────────────────────────────────────────
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("HOME_DELIVERY");
  const [department, setDepartment] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [streetType, setStreetType] = useState("");
  const [primaryNumber, setPrimaryNumber] = useState("");
  const [secondaryNumber, setSecondaryNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [step2Errors, setStep2Errors] = useState<Step2Errors>({});
  const [stockErrors, setStockErrors] = useState<string[]>([]);

  // ── Step 3 state ──────────────────────────────────────────────────────────
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [whatsappMessage, setWhatsappMessage] = useState<string | null>(null);

  // ── Progressive registration ───────────────────────────────────────────────
  const [showRegForm, setShowRegForm] = useState(false);
  const [regName, setRegName] = useState(prefill.name);
  const [regPassword, setRegPassword] = useState("");
  const [regTerms, setRegTerms] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  // ── Derived data ───────────────────────────────────────────────────────────
  const municipalities = getMunicipalitiesForDepartment(department);

  const builtAddress = streetType && primaryNumber && secondaryNumber
    ? formatColombianAddress({ streetType, primaryNumber, secondaryNumber, complement: complement || undefined })
    : "";

  // ── Handlers: Step 1 ──────────────────────────────────────────────────────

  const handleNameChange = useCallback((val: string) => {
    setFullName(sanitizeName(val));
    if (step1Errors.fullName) setStep1Errors((e) => ({ ...e, fullName: undefined }));
  }, [step1Errors.fullName]);

  const handlePhoneChange = useCallback((val: string) => {
    const sanitized = sanitizePhone(val).slice(0, 10);
    setPhone(sanitized);
    if (step1Errors.phone) setStep1Errors((e) => ({ ...e, phone: undefined }));
  }, [step1Errors.phone]);

  const handleEmailChange = useCallback((val: string) => {
    setEmail(val);
    if (step1Errors.email) setStep1Errors((e) => ({ ...e, email: undefined }));
  }, [step1Errors.email]);

  // ── Handlers: Step 2 ──────────────────────────────────────────────────────

  const handleDepartmentChange = useCallback((val: string) => {
    setDepartment(val);
    setMunicipality(""); // Reset municipality when department changes
    setStep2Errors((e) => ({ ...e, department: undefined, municipality: undefined }));
  }, []);

  // ── Apply saved address ────────────────────────────────────────────────────

  function applySavedAddress(addr: SavedAddress) {
    setDepartment(addr.department);
    setMunicipality(addr.municipality);
    // Saved addresses use legacy flat format — can't fill structured fields
    setNeighborhood(addr.neighborhood ?? "");
    setStep2Errors({});
  }

  // ── Validate Step 1 → go to Step 2 ────────────────────────────────────────

  function goToStep2() {
    const result = checkoutStep1Schema.safeParse({
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
    });

    if (!result.success) {
      const fieldErrors: Step1Errors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof Step1Errors;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setStep1Errors(fieldErrors);
      return;
    }

    setStep1Errors({});
    setStep(2);
  }

  // ── Validate Step 2 → go to Step 3 (with stock check) ──────────────────────

  function goToStep3() {
    if (deliveryMethod === "HOME_DELIVERY") {
      const result = checkoutStep2HomeDeliverySchema.safeParse({
        deliveryMethod: "HOME_DELIVERY",
        department,
        municipality,
        streetType,
        primaryNumber,
        secondaryNumber,
        complement: complement || undefined,
        neighborhood: neighborhood || undefined,
      });

      if (!result.success) {
        const fieldErrors: Step2Errors = {};
        for (const issue of result.error.issues) {
          const field = issue.path[0] as keyof Step2Errors;
          if (!fieldErrors[field]) fieldErrors[field] = issue.message;
        }
        setStep2Errors(fieldErrors);
        return;
      }
    }

    setStep2Errors({});
    setStockErrors([]);

    startTransition(async () => {
      const stockResult = await validateStockAction(sessionId);
      if (stockResult.data && !stockResult.data.valid) {
        setStockErrors(stockResult.data.insufficientItems.map((i) => i.productName));
        return;
      }
      setStep(3);
    });
  }

  // ── Submit order ───────────────────────────────────────────────────────────

  function handleSubmit() {
    setTermsError(false);
    setOrderError(null);

    if (!termsAccepted) {
      setTermsError(true);
      return;
    }

    startTransition(async () => {
      const result = await createOrderAction({
        clientName: fullName.trim(),
        clientPhone: phone.trim(),
        clientEmail: email.trim() || null,
        deliveryMethod,
        shippingDepartment: deliveryMethod === "HOME_DELIVERY" ? department : null,
        shippingMunicipality: deliveryMethod === "HOME_DELIVERY" ? municipality : null,
        shippingAddress: deliveryMethod === "HOME_DELIVERY" ? builtAddress : null,
        shippingNeighborhood: deliveryMethod === "HOME_DELIVERY" ? (neighborhood || null) : null,
        storePickupAddress:
          deliveryMethod === "STORE_PICKUP" ? (storeConfig?.storePhysicalAddress ?? null) : null,
        productsTotal: cart.finalSubtotal,
        wholesalePriceApplied: cart.wholesaleApplied,
        termsAccepted: true,
        items: cart.items.map((i) => ({
          productId: i.productId,
          productName: i.productName,
          quantity: i.quantity,
          unitPriceAtPurchase: i.unitPrice,
        })),
      });

      if (result.error) {
        if (result.error.code === "INSUFFICIENT_STOCK") {
          setOrderError("Algunos productos ya no tienen stock suficiente. Revisa tu carrito.");
        } else {
          setOrderError(result.error.message);
        }
        return;
      }

      const { whatsappUrl } = result.data;
      try {
        window.open(whatsappUrl, "_blank");
        router.push("/pedidos");
      } catch {
        setWhatsappMessage(whatsappUrl);
      }
    });
  }

  // ── Progressive registration submit ───────────────────────────────────────

  function handleRegister() {
    setRegError(null);
    startTransition(async () => {
      const result = await registerAction({
        name: regName,
        email,
        password: regPassword,
        termsAccepted: regTerms,
      });
      if (result.error) {
        setRegError(
          result.error.code === "EMAIL_ALREADY_EXISTS"
            ? "El correo ya está registrado."
            : result.error.message,
        );
      } else {
        setShowRegForm(false);
        router.refresh();
      }
    });
  }

  // ── WhatsApp fallback ──────────────────────────────────────────────────────

  if (whatsappMessage) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-6">
        <p className="mb-4 text-sm text-gray-600">
          No se pudo abrir WhatsApp automáticamente. Copia el mensaje y envíalo manualmente:
        </p>
        <pre className="mb-4 max-h-60 overflow-auto rounded-lg bg-gray-50 p-4 text-xs text-gray-800 whitespace-pre-wrap">
          {decodeURIComponent(whatsappMessage.split("?text=")[1] ?? "")}
        </pre>
        <button
          onClick={() => {
            const text = decodeURIComponent(whatsappMessage.split("?text=")[1] ?? "");
            navigator.clipboard.writeText(text);
          }}
          className="rounded-full bg-cerise-600 px-5 py-2 text-sm font-semibold text-white hover:bg-cerise-700"
        >
          Copiar mensaje
        </button>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="grid lg:grid-cols-[1fr_380px] gap-8 lg:gap-12">
      {/* ── Formulario principal (izquierda) ── */}
      <div className="space-y-6">

        {/* Progress indicator - horizontal en desktop */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {([1, 2, 3] as const).map((s, idx) => (
              <div key={s} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-2 flex-1">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all ${
                      step === s
                        ? "bg-cerise-600 text-white shadow-md"
                        : step > s
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {step > s ? "✓" : s}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${step === s ? "text-gray-900" : "text-gray-400"}`}>
                    {s === 1 ? "Datos" : s === 2 ? "Entrega" : "Confirmar"}
                  </span>
                </div>
                {idx < 2 && (
                  <div className={`h-0.5 flex-1 mx-4 ${step > s ? "bg-green-500" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════════════ STEP 1 ═══════════════════ */}
        {step === 1 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">1. IDENTIFICACIÓN</h2>
              <button
                type="button"
                onClick={() => {/* Edit callback si se necesita */}}
                className="text-sm text-cerise-600 hover:underline"
              >
                
              </button>
            </div>

            <div className="space-y-5 max-w-xl">
              <ValidatedInput
                id="fullName"
                label="Nombre completo"
                required
                type="text"
                value={fullName}
                onChange={handleNameChange}
                error={step1Errors.fullName}
                placeholder="Ej: Nicolás Muñoz"
                autoComplete="name"
              />

              <ValidatedInput
                id="phone"
                label="Celular"
                required
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={handlePhoneChange}
                error={step1Errors.phone}
                placeholder="3001234567"
                maxLength={10}
                autoComplete="tel"
              />

              {!isAuthenticated && (
                <ValidatedInput
                  id="email"
                  label="Correo electrónico"
                  type="email"
                  inputMode="email"
                  value={email}
                  onChange={handleEmailChange}
                  error={step1Errors.email}
                  helperText="Opcional. Para enviarte la confirmación."
                  placeholder="tu@correo.com"
                  autoComplete="email"
                />
              )}

              <div className="pt-4">
                <button
                  onClick={goToStep2}
                  disabled={isPending}
                  className="w-full sm:w-auto px-8 py-3 bg-cerise-600 text-white text-sm font-semibold rounded hover:bg-cerise-700 disabled:opacity-60 transition-colors"
                >
                  Continuar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════ STEP 2 ═══════════════════ */}
        {step === 2 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">2. DIRECCIÓN DE ENVÍO</h2>
            </div>

            <div className="space-y-6 max-w-xl">
              {/* Delivery method selector */}
              <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                {(["HOME_DELIVERY", "STORE_PICKUP"] as const).map((method) => (
                  <label
                    key={method}
                    className="flex items-center gap-3 cursor-pointer flex-1"
                  >
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value={method}
                      checked={deliveryMethod === method}
                      onChange={() => {
                        setDeliveryMethod(method);
                        setStep2Errors({});
                      }}
                      className="h-4 w-4 text-cerise-600 focus:ring-cerise-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {method === "HOME_DELIVERY" ? "📦 Domicilio" : "🏪 Retiro en tienda"}
                    </span>
                  </label>
                ))}
              </div>

              {/* ── HOME_DELIVERY fields ── */}
              {deliveryMethod === "HOME_DELIVERY" && (
                <div className="space-y-5">
                  {/* Saved addresses */}
                  {savedAddresses.length > 0 && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-3">
                        Direcciones guardadas:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {savedAddresses.map((addr) => (
                          <button
                            key={addr.id}
                            type="button"
                            onClick={() => applySavedAddress(addr)}
                            className="px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:border-cerise-400 hover:bg-cerise-50 transition-colors"
                          >
                            {addr.addressName}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Department selector */}
                  <div>
                    <label htmlFor="department" className="mb-1 block text-sm font-medium text-gray-700">
                      Departamento <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="department"
                      value={department}
                      onChange={(e) => handleDepartmentChange(e.target.value)}
                      className={`w-full rounded-lg border px-3 py-2.5 text-sm bg-white focus:outline-none transition-colors ${
                        step2Errors.department
                          ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                          : "border-gray-200 focus:border-cerise-400 focus:ring-2 focus:ring-cerise-100"
                      }`}
                    >
                      <option value="">Selecciona un departamento...</option>
                      {COLOMBIAN_DEPARTMENTS.map((dept) => (
                        <option key={dept.code} value={dept.name}>{dept.name}</option>
                      ))}
                    </select>
                    {step2Errors.department && (
                      <p role="alert" className="mt-1 flex items-center gap-1 text-xs text-red-500">
                        <span>⚠</span> {step2Errors.department}
                      </p>
                    )}
                  </div>

                  {/* Municipality selector */}
                  <div>
                    <label htmlFor="municipality" className="mb-1 block text-sm font-medium text-gray-700">
                      Municipio <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="municipality"
                      value={municipality}
                      onChange={(e) => {
                        setMunicipality(e.target.value);
                        setStep2Errors((err) => ({ ...err, municipality: undefined }));
                      }}
                      disabled={!department}
                      className={`w-full rounded-lg border px-3 py-2.5 text-sm bg-white focus:outline-none transition-colors ${
                        step2Errors.municipality
                          ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                          : "border-gray-200 focus:border-cerise-400 focus:ring-2 focus:ring-cerise-100"
                      } ${!department ? "bg-gray-50 cursor-not-allowed" : ""}`}
                    >
                      <option value="">
                        {department ? "Selecciona un municipio..." : "Primero selecciona el departamento"}
                      </option>
                      {municipalities.map((muni) => (
                        <option key={muni.code} value={muni.name}>{muni.name}</option>
                      ))}
                    </select>
                    {step2Errors.municipality && (
                      <p role="alert" className="mt-1 flex items-center gap-1 text-xs text-red-500">
                        <span>⚠</span> {step2Errors.municipality}
                      </p>
                    )}
                  </div>

                  {/* Colombian structured address */}
                  <div>
                    <p className="mb-2 text-sm font-medium text-gray-700">
                      Dirección <span className="text-red-500">*</span>
                    </p>
                    <ColombianAddressInput
                      streetType={streetType}
                      primaryNumber={primaryNumber}
                      secondaryNumber={secondaryNumber}
                      complement={complement}
                      onStreetTypeChange={(val) => {
                        setStreetType(val);
                        setStep2Errors((e) => ({ ...e, streetType: undefined }));
                      }}
                      onPrimaryNumberChange={(val) => {
                        setPrimaryNumber(val);
                        setStep2Errors((e) => ({ ...e, primaryNumber: undefined }));
                      }}
                      onSecondaryNumberChange={(val) => {
                        setSecondaryNumber(val);
                        setStep2Errors((e) => ({ ...e, secondaryNumber: undefined }));
                      }}
                      onComplementChange={setComplement}
                      errors={{
                        streetType: step2Errors.streetType,
                        primaryNumber: step2Errors.primaryNumber,
                        secondaryNumber: step2Errors.secondaryNumber,
                        complement: step2Errors.complement,
                      }}
                    />
                  </div>

                  {/* Neighborhood */}
                  <ValidatedInput
                    id="neighborhood"
                    label="Barrio"
                    type="text"
                    value={neighborhood}
                    onChange={(val) => {
                      setNeighborhood(val);
                      setStep2Errors((e) => ({ ...e, neighborhood: undefined }));
                    }}
                    error={step2Errors.neighborhood}
                    helperText="Opcional"
                    placeholder="Ej: El Poblado"
                  />

                  <p className="rounded-lg bg-blue-50 px-3 py-2.5 text-sm text-blue-700 border border-blue-100">
                    📦 El costo de envío será comunicado por WhatsApp al recibir tu pedido.
                  </p>
                </div>
              )}

              {/* ── STORE_PICKUP ── */}
              {deliveryMethod === "STORE_PICKUP" && storeConfig && (
                <div className="rounded-lg bg-blush-soft px-4 py-3 border border-cerise-100">
                  <p className="text-sm font-medium text-gray-700">📍 Dirección de retiro:</p>
                  <p className="mt-1 text-sm text-gray-600">{storeConfig.storePhysicalAddress}</p>
                </div>
              )}

              {/* Stock errors */}
              {stockErrors.length > 0 && (
                <div className="rounded-lg bg-red-50 px-4 py-3 border border-red-200">
                  <p className="text-sm font-semibold text-red-700">Sin stock suficiente para:</p>
                  <ul className="mt-1 list-disc pl-5 text-sm text-red-600 space-y-0.5">
                    {stockErrors.map((name) => <li key={name}>{name}</li>)}
                  </ul>
                </div>
              )}

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Atrás
                </button>
                <button
                  onClick={goToStep3}
                  disabled={isPending}
                  className="px-8 py-3 bg-cerise-600 text-white text-sm font-semibold rounded hover:bg-cerise-700 disabled:opacity-60 transition-colors"
                >
                  {isPending ? "Verificando stock..." : "Continuar"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════ STEP 3 ═══════════════════ */}
        {step === 3 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">3. CONFIRMAR PEDIDO</h2>
            </div>

            <div className="space-y-6 max-w-xl">
              {/* Order items */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Productos</h3>
                <div className="divide-y divide-gray-100 text-sm bg-gray-50 rounded-lg p-4">
                  {cart.items.map((item) => (
                    <div key={item.productId} className="flex justify-between py-2.5 first:pt-0 last:pb-0">
                      <span className="text-gray-700">{item.productName} × {item.quantity}</span>
                      <span className="font-medium text-gray-900">{formatCOP(item.lineTotal)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between border-t border-gray-200 pt-4 text-sm">
                <span className="font-semibold text-gray-800">Total</span>
                <span className="text-base font-bold text-gray-900">{formatCOP(cart.finalSubtotal)}</span>
              </div>

              {/* Delivery summary */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Método de entrega</h3>
                <div className="rounded-lg bg-blue-50 px-4 py-3 text-sm border border-blue-200">
                  {deliveryMethod === "HOME_DELIVERY" ? (
                    <>
                      <p className="font-medium text-gray-800">🚚 Envío a domicilio</p>
                      {builtAddress && (
                        <p className="mt-1 text-gray-700 font-mono text-xs">{builtAddress}</p>
                      )}
                      <p className="mt-0.5 text-gray-600">
                        {[neighborhood, municipality, department].filter(Boolean).join(", ")}
                      </p>
                      <p className="mt-2 text-xs text-blue-700 font-medium">
                        📦 El costo de envío será informado por WhatsApp.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium text-gray-800">🏪 Retiro en tienda</p>
                      <p className="mt-1 text-gray-600">{storeConfig?.storePhysicalAddress}</p>
                    </>
                  )}
                </div>
              </div>

              {/* Progressive registration */}
              {!isAuthenticated && !showRegForm && (
                <div className="rounded-lg border border-gray-200 px-4 py-3 bg-gray-50">
                  <p className="text-sm text-gray-700">
                    ¿Quieres hacer seguimiento de tu pedido?{" "}
                    <button
                      type="button"
                      onClick={() => { setShowRegForm(true); setRegName(fullName); }}
                      className="font-medium text-cerise-600 hover:underline transition-colors"
                    >
                      Crea una cuenta ahora
                    </button>
                  </p>
                </div>
              )}

              {showRegForm && (
                <div className="flex flex-col gap-4 rounded-lg border border-gray-200 p-5 bg-gray-50">
                  <h3 className="text-sm font-semibold text-gray-800">Crear cuenta para seguimiento</h3>
                  <ValidatedInput
                    id="regName"
                    label="Nombre"
                    required
                    type="text"
                    value={regName}
                    onChange={(val) => setRegName(sanitizeName(val))}
                    placeholder="Tu nombre completo"
                  />
                  <ValidatedInput
                    id="regPassword"
                    label="Contraseña"
                    required
                    type="password"
                    value={regPassword}
                    onChange={setRegPassword}
                    helperText="Mínimo 8 caracteres, una mayúscula y un número"
                    placeholder="••••••••"
                  />
                  <label className="flex items-start gap-2 text-xs text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={regTerms}
                      onChange={(e) => setRegTerms(e.target.checked)}
                      className="mt-0.5 h-4 w-4 text-cerise-600"
                    />
                    Acepto los Términos y Condiciones y la Política de Tratamiento de Datos Personales.
                  </label>
                  {regError && <p role="alert" className="text-xs text-red-500">{regError}</p>}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleRegister}
                      disabled={isPending}
                      className="px-5 py-2 bg-cerise-600 text-white text-sm font-semibold rounded hover:bg-cerise-700 disabled:opacity-60 transition-colors"
                    >
                      Crear cuenta
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowRegForm(false)}
                      className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* Terms */}
              <div className="space-y-2">
                <label className="flex cursor-pointer items-start gap-3 text-sm text-gray-700 p-4 rounded-lg border border-gray-200 hover:border-cerise-300 transition-colors">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => { setTermsAccepted(e.target.checked); setTermsError(false); }}
                    className="mt-0.5 h-4 w-4 text-cerise-600 rounded focus:ring-cerise-500"
                  />
                  <span>Acepto los Términos y Condiciones y la Política de Tratamiento de Datos Personales.</span>
                </label>
                {termsError && (
                  <p role="alert" className="flex items-center gap-1 text-xs text-red-500 px-4">
                    <span>⚠</span> Debes aceptar los términos para continuar.
                  </p>
                )}
              </div>

              {orderError && (
                <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-200">
                  {orderError}
                </p>
              )}

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setStep(2)}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Atrás
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isPending}
                  className="px-8 py-3 bg-cerise-600 text-white text-sm font-semibold rounded hover:bg-cerise-700 disabled:opacity-60 transition-colors"
                >
                  {isPending ? "Procesando..." : "Confirmar pedido por WhatsApp"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Resumen de la compra (derecha) ── */}
      <aside className="lg:sticky lg:top-8 h-fit">
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h3 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-3">
            RESUMEN DE LA COMPRA
          </h3>
          
          <div className="space-y-3">
            {cart.items.map((item) => (
              <div key={item.productId} className="flex gap-3">
                {item.mainImageUrl ? (
                  <img
                    src={item.mainImageUrl}
                    alt={item.productName}
                    className="w-16 h-16 object-cover rounded bg-gray-100"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.productName}</p>
                  <p className="text-xs text-gray-500 mt-1">Cantidad: {item.quantity}</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{formatCOP(item.lineTotal)}</p>
                  <p className="text-xs text-gray-400">Hasta 3 días</p>
                </div>
              </div>
            ))}
          </div>

          {cart.wholesaleApplied && (
            <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm text-green-700">
              ✓ Precio mayorista aplicado
            </div>
          )}

          {!cart.wholesaleApplied && cart.amountToThreshold && (
            <div className="bg-cerise-50 border border-cerise-200 rounded-lg px-3 py-2 text-sm text-cerise-700">
              Te faltan <strong>{formatCOP(cart.amountToThreshold)}</strong> para precio mayorista
            </div>
          )}

          <div className="border-t border-gray-200 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold text-gray-900">{formatCOP(cart.finalSubtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Envío</span>
              <span className="text-xs text-gray-400">Se informa por WhatsApp</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
              <span>Total</span>
              <span>{formatCOP(cart.finalSubtotal)}</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
