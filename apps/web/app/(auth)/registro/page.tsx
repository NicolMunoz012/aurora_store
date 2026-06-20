"use client";
// =============================================================================
// app/(auth)/registro/page.tsx — Registration form with inline validation
// =============================================================================

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerAction } from "@/lib/actions/auth.actions";

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

  function handleBlur(field: string) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    // Validate on blur
    const errors = validateFields(name, email, password, termsAccepted);
    setFieldErrors(errors);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);

    // Validate all fields
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-xl font-bold text-gray-900">Crear cuenta</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          {/* Name */}
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-700">
              Nombre completo
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => handleBlur("name")}
              className={`w-full rounded-xl border px-4 py-2.5 text-sm shadow-sm transition-all focus:outline-none focus:ring-2 ${
                touched.name && fieldErrors.name
                  ? "border-red-300 focus:border-red-300 focus:ring-red-100"
                  : "border-gray-200 focus:border-cerise-300 focus:ring-cerise-100"
              }`}
              placeholder="Ej: María López"
            />
            {touched.name && fieldErrors.name && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value.replace(/\s/g, ""))}
              onBlur={() => handleBlur("email")}
              className={`w-full rounded-xl border px-4 py-2.5 text-sm shadow-sm transition-all focus:outline-none focus:ring-2 ${
                touched.email && fieldErrors.email
                  ? "border-red-300 focus:border-red-300 focus:ring-red-100"
                  : "border-gray-200 focus:border-cerise-300 focus:ring-cerise-100"
              }`}
              placeholder="correo@ejemplo.com"
            />
            {touched.email && fieldErrors.email && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value.replace(/\s/g, ""))}
              onBlur={() => handleBlur("password")}
              className={`w-full rounded-xl border px-4 py-2.5 text-sm shadow-sm transition-all focus:outline-none focus:ring-2 ${
                touched.password && fieldErrors.password
                  ? "border-red-300 focus:border-red-300 focus:ring-red-100"
                  : "border-gray-200 focus:border-cerise-300 focus:ring-cerise-100"
              }`}
              placeholder="Mínimo 8 caracteres"
            />
            {touched.password && fieldErrors.password && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.password}</p>
            )}
            <PasswordStrength password={password} />
          </div>

          {/* Terms */}
          <div className="flex flex-col gap-1">
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
                <a href="/terminos" className="text-cerise-600 underline hover:text-cerise-700">
                  Términos y Condiciones
                </a>{" "}
                y la{" "}
                <a href="/privacidad" className="text-cerise-600 underline hover:text-cerise-700">
                  Política de Datos
                </a>
                .
              </span>
            </label>
            {touched.terms && fieldErrors.terms && (
              <p className="text-xs text-red-500">{fieldErrors.terms}</p>
            )}
          </div>

          {/* Server error */}
          {serverError && (
            <div className="rounded-lg bg-red-50 px-3 py-2">
              <p className="text-sm text-red-600">{serverError}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="rounded-full bg-cerise-500 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-cerise-600 hover:shadow-md disabled:opacity-60"
          >
            {isPending ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-medium text-cerise-600 underline hover:text-cerise-700">
            Ingresar
          </Link>
        </p>
      </div>
    </div>
  );
}
