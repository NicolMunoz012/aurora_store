"use client";
// =============================================================================
// app/(auth)/registro/page.tsx — Registration form with inline validation
// =============================================================================

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { registerAction } from "@/lib/actions/auth.actions";
import { LegalModal } from "@/components/ui/LegalModal";
import { TermsContent } from "@/components/ui/TermsContent";
import { PrivacyContent } from "@/components/ui/PrivacyContent";

const NAME_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  terms?: string;
}

function validateFields(name: string, email: string, password: string, termsAccepted: boolean): FieldErrors {
  const errors: FieldErrors = {};

  const trimmedName = name.trim();
  if (!trimmedName) {
    errors.name = "El nombre es obligatorio.";
  } else if (trimmedName.length < 2) {
    errors.name = "Mínimo 2 caracteres.";
  } else if (!NAME_REGEX.test(trimmedName)) {
    errors.name = "Solo letras y espacios. No se permiten números ni caracteres especiales.";
  }

  const trimmedEmail = email.trim();
  if (!trimmedEmail) {
    errors.email = "El correo es obligatorio.";
  } else if (/\s/.test(trimmedEmail)) {
    errors.email = "El correo no puede contener espacios.";
  } else if (!EMAIL_REGEX.test(trimmedEmail)) {
    errors.email = "Formato de correo no válido.";
  }

  if (!password) {
    errors.password = "La contraseña es obligatoria.";
  } else if (/\s/.test(password)) {
    errors.password = "La contraseña no puede contener espacios.";
  } else if (password.length < 8) {
    errors.password = "Mínimo 8 caracteres.";
  } else if (!/[A-Z]/.test(password)) {
    errors.password = "Debe incluir al menos una mayúscula.";
  } else if (!/[a-z]/.test(password)) {
    errors.password = "Debe incluir al menos una minúscula.";
  } else if (!/[0-9]/.test(password)) {
    errors.password = "Debe incluir al menos un número.";
  }

  if (!termsAccepted) {
    errors.terms = "Debes aceptar los términos para continuar.";
  }

  return errors;
}

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ caracteres", valid: password.length >= 8 },
    { label: "Una mayúscula", valid: /[A-Z]/.test(password) },
    { label: "Una minúscula", valid: /[a-z]/.test(password) },
    { label: "Un número", valid: /[0-9]/.test(password) },
  ];

  if (!password) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {checks.map((check) => (
        <span
          key={check.label}
          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
            check.valid ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"
          }`}
        >
          {check.valid ? "✓" : "○"} {check.label}
        </span>
      ))}
    </div>
  );
}

export default function RegistroPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  function handleBlur(field: string) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errors = validateFields(name, email, password, termsAccepted);
    setFieldErrors(errors);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);

    const errors = validateFields(name, email, password, termsAccepted);
    setFieldErrors(errors);
    setTouched({ name: true, email: true, password: true, terms: true });

    if (Object.keys(errors).length > 0) return;

    startTransition(async () => {
      const result = await registerAction({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        termsAccepted,
      });

      if (result.error) {
        if (result.error.code === "EMAIL_ALREADY_EXISTS") {
          setFieldErrors((prev) => ({ ...prev, email: "Este correo ya está registrado." }));
        } else if (result.error.code === "INVALID_NAME") {
          setFieldErrors((prev) => ({ ...prev, name: result.error!.message }));
        } else if (result.error.code === "INVALID_EMAIL") {
          setFieldErrors((prev) => ({ ...prev, email: result.error!.message }));
        } else if (result.error.code === "INVALID_PASSWORD") {
          setFieldErrors((prev) => ({ ...prev, password: result.error!.message }));
        } else {
          setServerError(result.error.message);
        }
      } else {
        router.push("/catalog");
        router.refresh();
      }
    });
  }

  const inputBase = "w-full px-4 py-3 bg-white border rounded-sm text-sm focus:outline-none transition-colors";
  const inputOk = "border-gray-200 focus:border-cerise-400";
  const inputErr = "border-red-300 focus:border-red-400";

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Brand panel */}
      <div className="hidden lg:flex relative bg-blush items-center justify-center p-16">
        <div className="absolute top-8 left-8">
          <Image src="/aurora.png" alt="Aurora Belleza" width={90} height={28} />
        </div>
        <div className="text-center max-w-md">
          <span className="text-cerise-600 text-[11px] font-semibold tracking-luxe mb-6 block">
            Únete al ritual
          </span>
          <p className="font-serif text-3xl md:text-4xl leading-snug text-balance italic text-gray-800">
            "Cada mujer merece sentirse radiante, todos los días."
          </p>
          <p className="text-[11px] tracking-luxe text-gray-400 mt-8 font-medium">
            — Aurora Belleza
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <Image src="/aurora.png" alt="Aurora Belleza" width={80} height={26} />
          </div>
          <div className="mb-6">
            <Link href="/catalog" className="inline-flex items-center gap-1.5 text-[11px] tracking-luxe text-gray-400 hover:text-cerise-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-3.5"><path fillRule="evenodd" d="M14 8a.75.75 0 0 1-.75.75H4.56l3.22 3.22a.75.75 0 1 1-1.06 1.06l-4.5-4.5a.75.75 0 0 1 0-1.06l4.5-4.5a.75.75 0 0 1 1.06 1.06L4.56 7.25H13.25A.75.75 0 0 1 14 8Z" clipRule="evenodd" /></svg>
              Volver al catálogo
            </Link>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl mb-2">Comienza tu ritual.</h1>
          <p className="text-gray-500 text-sm mb-8">Crea tu cuenta Aurora Belleza.</p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Name */}
            <div>
              <label htmlFor="name" className="text-[11px] tracking-luxe font-medium text-gray-500 mb-1.5 block">
                Nombre completo
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => handleBlur("name")}
                placeholder="Ej: María López"
                className={`${inputBase} ${touched.name && fieldErrors.name ? inputErr : inputOk}`}
              />
              {touched.name && fieldErrors.name && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="text-[11px] tracking-luxe font-medium text-gray-500 mb-1.5 block">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value.replace(/\s/g, ""))}
                onBlur={() => handleBlur("email")}
                placeholder="correo@ejemplo.com"
                className={`${inputBase} ${touched.email && fieldErrors.email ? inputErr : inputOk}`}
              />
              {touched.email && fieldErrors.email && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="text-[11px] tracking-luxe font-medium text-gray-500 mb-1.5 block">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value.replace(/\s/g, ""))}
                onBlur={() => handleBlur("password")}
                placeholder="Mínimo 8 caracteres"
                className={`${inputBase} ${touched.password && fieldErrors.password ? inputErr : inputOk}`}
              />
              {touched.password && fieldErrors.password && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.password}</p>
              )}
              <PasswordStrength password={password} />
            </div>

            {/* Terms */}
            <div className="flex flex-col gap-1 pt-1">
              <label className="flex cursor-pointer items-start gap-2.5 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => {
                    setTermsAccepted(e.target.checked);
                    if (e.target.checked) {
                      setFieldErrors((prev) => {
                        const { terms, ...rest } = prev;
                        return rest;
                      });
                    }
                  }}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-cerise-500 focus:ring-cerise-300"
                />
                <span>
                  Acepto los{" "}
                  <button type="button" onClick={() => setShowTerms(true)} className="text-cerise-600 underline hover:text-cerise-700">
                    Términos y Condiciones
                  </button>{" "}
                  y la{" "}
                  <button type="button" onClick={() => setShowPrivacy(true)} className="text-cerise-600 underline hover:text-cerise-700">
                    Política de Datos
                  </button>
                  .
                </span>
              </label>
              {touched.terms && fieldErrors.terms && (
                <p className="text-xs text-red-500">{fieldErrors.terms}</p>
              )}
            </div>

            {/* Server error */}
            {serverError && (
              <div className="bg-cerise-50 border border-cerise-100 rounded-sm px-4 py-2.5">
                <p className="text-sm text-cerise-700">{serverError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-cerise-600 text-white py-3.5 text-[12px] tracking-luxe font-semibold rounded-sm hover:bg-cerise-700 transition-colors disabled:opacity-60"
            >
              {isPending ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-cerise-600 font-medium hover:underline">
              Ingresar
            </Link>
          </p>
        </div>
      </div>

      {/* Legal modals */}
      <LegalModal open={showTerms} onClose={() => setShowTerms(false)} title="Términos y Condiciones">
        <TermsContent />
      </LegalModal>
      <LegalModal open={showPrivacy} onClose={() => setShowPrivacy(false)} title="Política de Datos">
        <PrivacyContent />
      </LegalModal>
    </div>
  );
}
