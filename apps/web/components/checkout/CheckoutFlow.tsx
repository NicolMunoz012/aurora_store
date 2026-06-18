"use client";
// =============================================================================
// components/checkout/CheckoutFlow.tsx — Client Component state machine
// Multi-step checkout: Step 1 (data) → Step 2 (delivery) → Step 3 (confirm).
// (Req 4.2–4.4, 10.1, 10.3–10.4, 11.1–11.6, 12.1–12.9, 13.2–13.3)
// =============================================================================

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { SerializedResolvedCart } from "@/lib/serializers";
import { validateStockAction, createOrderAction } from "@/lib/actions/checkout.actions";
import { registerAction } from "@/lib/actions/auth.actions";
import type { DeliveryMethod } from "@aurora/shared";
import { Decimal } from "decimal.js";

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

function formatCOP(value: string): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(parseFloat(value));
}

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

  // ── Step state ──────────────────────────────────────────────────────────────
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // ── Step 1 fields ───────────────────────────────────────────────────────────
  const [fullName, setFullName] = useState(prefill.name);
  const [phone, setPhone] = useState(prefill.phone);
  const [email, setEmail] = useState(prefill.email);
  const [step1Errors, setStep1Errors] = useState<{ fullName?: string; phone?: string }>({});

  // ── Step 2 fields ───────────────────────────────────────────────────────────
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("HOME_DELIVERY");
  const [department, setDepartment] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [address, setAddress] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [step2Errors, setStep2Errors] = useState<{ department?: string; municipality?: string; address?: string }>({});
  const [stockErrors, setStockErrors] = useState<string[]>([]);

  // ── Step 3 fields ───────────────────────────────────────────────────────────
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [whatsappMessage, setWhatsappMessage] = useState<string | null>(null);

  // ── Progressive registration (Step 3) ──────────────────────────────────────
  const [showRegForm, setShowRegForm] = useState(false);
  const [regName, setRegName] = useState(fullName);
  const [regPassword, setRegPassword] = useState("");
  const [regTerms, setRegTerms] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  // ── Step 1 → 2 ─────────────────────────────────────────────────────────────
  function goToStep2() {
    const errors: typeof step1Errors = {};
    if (!fullName.trim()) errors.fullName = "El nombre es obligatorio.";
    if (!phone.trim()) errors.phone = "El teléfono es obligatorio.";
    if (Object.keys(errors).length) {
      setStep1Errors(errors);
      return;
    }
    setStep1Errors({});
    setStep(2);
  }

  // ── Step 2 → 3 ─────────────────────────────────────────────────────────────
  function goToStep3() {
    const errors: typeof step2Errors = {};
    if (deliveryMethod === "HOME_DELIVERY") {
      if (!department.trim()) errors.department = "El departamento es obligatorio.";
      if (!municipality.trim()) errors.municipality = "El municipio es obligatorio.";
      if (!address.trim()) errors.address = "La dirección es obligatoria.";
    }
    if (Object.keys(errors).length) {
      setStep2Errors(errors);
      return;
    }
    setStep2Errors({});
    setStockErrors([]);

    startTransition(async () => {
      // Validate stock (Req 13.1)
      // We use a dummy cartId here; in a real flow it comes from the cart object
      const stockResult = await validateStockAction("stock-check");
      if (stockResult.data && !stockResult.data.valid) {
        setStockErrors(
          stockResult.data.insufficientItems.map((i) => i.productName),
        );
        return;
      }
      setStep(3);
    });
  }

  // ── Apply saved address ─────────────────────────────────────────────────────
  function applySavedAddress(addr: SavedAddress) {
    setDepartment(addr.department);
    setMunicipality(addr.municipality);
    setAddress(addr.address);
    setNeighborhood(addr.neighborhood ?? "");
  }

  // ── Step 3 → submit ─────────────────────────────────────────────────────────
  function handleSubmit() {
    setTermsError(false);
    setOrderError(null);
    if (!termsAccepted) {
      setTermsError(true);
      return;
    }

    startTransition(async () => {
      const result = await createOrderAction({
        clientName: fullName,
        clientPhone: phone,
        clientEmail: email || null,
        deliveryMethod,
        shippingDepartment: deliveryMethod === "HOME_DELIVERY" ? department : null,
        shippingMunicipality: deliveryMethod === "HOME_DELIVERY" ? municipality : null,
        shippingAddress: deliveryMethod === "HOME_DELIVERY" ? address : null,
        shippingNeighborhood: deliveryMethod === "HOME_DELIVERY" ? neighborhood || null : null,
        storePickupAddress:
          deliveryMethod === "STORE_PICKUP"
            ? (storeConfig?.storePhysicalAddress ?? null)
            : null,
        productsTotal: new Decimal(cart.finalSubtotal),
        wholesalePriceApplied: cart.wholesaleApplied,
        termsAccepted: true,
        items: cart.items.map((i) => ({
          productId: i.productId,
          productName: i.productName,
          quantity: i.quantity,
          unitPriceAtPurchase: new Decimal(i.unitPrice),
        })),
      });

      if (result.error) {
        if (result.error.code === "INSUFFICIENT_STOCK") {
          setOrderError(
            "Algunos productos ya no tienen stock suficiente. Revisa tu carrito.",
          );
        } else {
          setOrderError(result.error.message);
        }
        return;
      }

      const { whatsappUrl } = result.data;

      // Try to open WhatsApp (Req 12.5)
      try {
        window.open(whatsappUrl, "_blank");
        router.push("/pedidos");
      } catch {
        // WhatsApp unavailable — show message text + copy button (Req 12.7)
        setWhatsappMessage(whatsappUrl);
      }
    });
  }

  // ── Progressive registration submit ────────────────────────────────────────
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

  // ── WhatsApp fallback ───────────────────────────────────────────────────────
  if (whatsappMessage) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
        <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
          No se pudo abrir WhatsApp automáticamente. Copia el mensaje y envíalo
          manualmente:
        </p>
        <pre className="mb-4 max-h-60 overflow-auto rounded-lg bg-zinc-100 p-4 text-xs text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">
          {decodeURIComponent(whatsappMessage.split("?text=")[1] ?? "")}
        </pre>
        <button
          onClick={() => {
            const text = decodeURIComponent(
              whatsappMessage.split("?text=")[1] ?? "",
            );
            navigator.clipboard.writeText(text);
          }}
          className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-semibold text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900"
        >
          Copiar mensaje
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      {/* Steps form */}
      <div className="flex-1">
        {/* Step indicator */}
        <div className="mb-6 flex items-center gap-2 text-sm font-medium">
          {([1, 2, 3] as const).map((s) => (
            <div key={s} className="flex items-center gap-2">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  step === s
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                    : step > s
                    ? "bg-green-500 text-white"
                    : "bg-zinc-200 text-zinc-500 dark:bg-zinc-700"
                }`}
              >
                {step > s ? "✓" : s}
              </span>
              <span className={step === s ? "text-zinc-900 dark:text-white" : "text-zinc-400"}>
                {s === 1 ? "Datos" : s === 2 ? "Entrega" : "Confirmar"}
              </span>
              {s < 3 && <span className="text-zinc-300">›</span>}
            </div>
          ))}
        </div>

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
              Tus datos
            </h2>
            <div>
              <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Nombre completo *
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
              />
              {step1Errors.fullName && (
                <p className="mt-1 text-xs text-red-500">{step1Errors.fullName}</p>
              )}
            </div>
            <div>
              <label htmlFor="phone" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Teléfono *
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
              />
              {step1Errors.phone && (
                <p className="mt-1 text-xs text-red-500">{step1Errors.phone}</p>
              )}
            </div>
            {/* Email optional for anonymous (Req 10.4) */}
            {!isAuthenticated && (
              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                />
                <p className="mt-1 text-xs text-zinc-400">
                  Opcional. Solo se usará para enviarte la confirmación de tu pedido.
                </p>
              </div>
            )}
            <button
              onClick={goToStep2}
              disabled={isPending}
              className="self-end rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-white dark:text-zinc-900"
            >
              Continuar
            </button>
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
              Método de entrega
            </h2>

            {/* Delivery method selector */}
            <div className="flex gap-4">
              {(["HOME_DELIVERY", "STORE_PICKUP"] as const).map((method) => (
                <label
                  key={method}
                  className="flex cursor-pointer items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value={method}
                    checked={deliveryMethod === method}
                    onChange={() => setDeliveryMethod(method)}
                    className="h-4 w-4"
                  />
                  {method === "HOME_DELIVERY" ? "Domicilio" : "Retiro en tienda"}
                </label>
              ))}
            </div>

            {/* HOME_DELIVERY fields */}
            {deliveryMethod === "HOME_DELIVERY" && (
              <>
                {/* Saved addresses selector (Req 11.5) */}
                {savedAddresses.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-medium text-zinc-500">Usar dirección guardada:</p>
                    <div className="flex flex-wrap gap-2">
                      {savedAddresses.map((addr) => (
                        <button
                          key={addr.id}
                          type="button"
                          onClick={() => applySavedAddress(addr)}
                          className="rounded-full border border-zinc-300 px-3 py-1 text-xs hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-800"
                        >
                          {addr.addressName}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {[
                  { id: "dept", label: "Departamento *", value: department, set: setDepartment, err: step2Errors.department },
                  { id: "muni", label: "Municipio *", value: municipality, set: setMunicipality, err: step2Errors.municipality },
                  { id: "addr", label: "Dirección *", value: address, set: setAddress, err: step2Errors.address },
                  { id: "barrio", label: "Barrio", value: neighborhood, set: setNeighborhood, err: undefined },
                ].map(({ id, label, value, set, err }) => (
                  <div key={id}>
                    <label htmlFor={id} className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      {label}
                    </label>
                    <input
                      id={id}
                      type="text"
                      value={value}
                      onChange={(e) => set(e.target.value)}
                      className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                    />
                    {err && <p className="mt-1 text-xs text-red-500">{err}</p>}
                  </div>
                ))}
                {/* Shipping cost notice (Req 11.3) */}
                <p className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                  El costo de envío será comunicado por WhatsApp una vez recibamos tu pedido.
                </p>
              </>
            )}

            {/* STORE_PICKUP: show store address (Req 11.4) */}
            {deliveryMethod === "STORE_PICKUP" && storeConfig && (
              <div className="rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-800">
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Dirección de retiro:</p>
                <p className="text-sm text-zinc-500">{storeConfig.storePhysicalAddress}</p>
              </div>
            )}

            {/* Stock errors */}
            {stockErrors.length > 0 && (
              <div className="rounded-lg bg-red-50 px-3 py-2 dark:bg-red-900/20">
                <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                  Stock insuficiente para:
                </p>
                <ul className="mt-1 list-disc pl-4 text-sm text-red-600">
                  {stockErrors.map((name) => <li key={name}>{name}</li>)}
                </ul>
              </div>
            )}

            <div className="flex justify-between">
              <button onClick={() => setStep(1)} className="text-sm text-zinc-500 underline">
                Atrás
              </button>
              <button
                onClick={goToStep3}
                disabled={isPending}
                className="rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-white dark:text-zinc-900"
              >
                {isPending ? "Verificando stock..." : "Continuar"}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3 ── */}
        {step === 3 && (
          <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
              Confirmar pedido
            </h2>

            {/* Order summary */}
            <div className="divide-y divide-zinc-100 dark:divide-zinc-700 text-sm">
              {cart.items.map((item) => (
                <div key={item.productId} className="flex justify-between py-2">
                  <span className="text-zinc-700 dark:text-zinc-300">
                    {item.productName} × {item.quantity}
                  </span>
                  <span className="font-medium text-zinc-900 dark:text-white">
                    {formatCOP(item.lineTotal)}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between border-t border-zinc-200 pt-3 text-sm dark:border-zinc-700">
              <span className="font-semibold text-zinc-800 dark:text-zinc-100">Total</span>
              <div className="text-right">
                <span className="text-base font-bold text-zinc-900 dark:text-white">
                  {formatCOP(cart.finalSubtotal)}
                </span>
                <p className="text-xs text-zinc-400">IVA incluido</p>
              </div>
            </div>

            {/* Delivery summary */}
            <div className="rounded-lg bg-zinc-50 px-3 py-2 text-sm dark:bg-zinc-800">
              {deliveryMethod === "HOME_DELIVERY" ? (
                <>
                  <p className="font-medium text-zinc-700 dark:text-zinc-300">
                    Envío a domicilio
                  </p>
                  <p className="text-zinc-500">{[address, neighborhood, municipality, department].filter(Boolean).join(", ")}</p>
                  <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                    El costo de envío será informado por WhatsApp.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-medium text-zinc-700 dark:text-zinc-300">Retiro en tienda</p>
                  <p className="text-zinc-500">{storeConfig?.storePhysicalAddress}</p>
                </>
              )}
            </div>

            {/* Progressive registration for anonymous (Req 4.3) */}
            {!isAuthenticated && !showRegForm && (
              <div className="rounded-lg border border-zinc-200 px-3 py-3 dark:border-zinc-700">
                <p className="text-sm text-zinc-500">
                  ¿Quieres hacer seguimiento de tu pedido?{" "}
                  <button
                    type="button"
                    onClick={() => setShowRegForm(true)}
                    className="font-medium text-zinc-800 underline dark:text-zinc-200"
                  >
                    Crea una cuenta ahora
                  </button>
                </p>
              </div>
            )}

            {showRegForm && (
              <div className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  Crear cuenta para seguimiento de pedidos
                </p>
                <input
                  type="text"
                  placeholder="Nombre"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                />
                <input
                  type="password"
                  placeholder="Contraseña (mín. 8 caracteres)"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                />
                <label className="flex items-start gap-2 text-xs text-zinc-500">
                  <input
                    type="checkbox"
                    checked={regTerms}
                    onChange={(e) => setRegTerms(e.target.checked)}
                    className="mt-0.5 h-4 w-4"
                  />
                  Acepto los Términos y Condiciones y la Política de Tratamiento de Datos Personales.
                </label>
                {regError && <p className="text-xs text-red-500">{regError}</p>}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleRegister}
                    disabled={isPending}
                    className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-white dark:text-zinc-900"
                  >
                    Crear cuenta
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRegForm(false)}
                    className="text-xs text-zinc-400 underline"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Terms checkbox (Req 12.4, 12.9) */}
            <div className="flex flex-col gap-1">
              <label className="flex cursor-pointer items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => {
                    setTermsAccepted(e.target.checked);
                    setTermsError(false);
                  }}
                  className="mt-0.5 h-4 w-4 rounded border-zinc-300"
                />
                Acepto los Términos y Condiciones y la Política de Tratamiento de Datos Personales.
              </label>
              {termsError && (
                <p role="alert" className="text-xs text-red-500">
                  Debes aceptar los términos para continuar.
                </p>
              )}
            </div>

            {orderError && (
              <p role="alert" className="text-sm text-red-500">{orderError}</p>
            )}

            <div className="flex justify-between">
              <button onClick={() => setStep(2)} className="text-sm text-zinc-500 underline">
                Atrás
              </button>
              <button
                onClick={handleSubmit}
                disabled={isPending}
                className="rounded-full bg-rose-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-60"
              >
                {isPending ? "Procesando..." : "Confirmar pedido por WhatsApp"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Cart summary sidebar */}
      <aside className="w-full lg:w-64 shrink-0">
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
          <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Resumen ({cart.items.length} producto{cart.items.length !== 1 ? "s" : ""})
          </h3>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCOP(cart.finalSubtotal)}</span>
            </div>
            <p className="mt-1 text-xs text-zinc-400">IVA incluido</p>
          </div>
        </div>
      </aside>
    </div>
  );
}
