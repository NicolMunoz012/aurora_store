"use client";
// =============================================================================
// app/(auth)/reset-password/page.tsx — New password form (editorial style)
// =============================================================================

import { Suspense, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { resetPasswordAction } from "@/lib/actions/auth.actions";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (/\s/.test(newPassword)) {
      setError("La contraseña no puede contener espacios.");
      return;
    }
    if (newPassword.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setError("Debe incluir al menos una mayúscula.");
      return;
    }
    if (!/[a-z]/.test(newPassword)) {
      setError("Debe incluir al menos una minúscula.");
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      setError("Debe incluir al menos un número.");
      return;
    }
    if (newPassword !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    startTransition(async () => {
      const result = await resetPasswordAction({ token: token!, newPassword });
      if (result.error) {
        if (result.error.code === "INVALID_TOKEN" || result.error.code === "TOKEN_EXPIRED") {
          setError("El enlace ha expirado o ya fue utilizado. Solicita uno nuevo.");
        } else {
          setError(result.error.message);
        }
      } else {
        setSuccess(true);
      }
    });
  }

  const inputBase = "w-full px-4 py-3 pr-10 bg-white border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-cerise-400 transition-colors [&::-webkit-credentials-auto-fill-button]:hidden [&::-ms-reveal]:hidden";

  // ── No token ──
  if (!token) {
    return (
      <div className="w-full max-w-sm text-center">
        <Link href="/"><Image src="/aurora.png" alt="Aurora Belleza" width={90} height={28} className="mx-auto mb-10" /></Link>
        <h1 className="font-serif text-3xl mb-3 text-gray-900">Enlace inválido</h1>
        <p className="text-gray-500 text-sm mb-8">
          Este enlace de restablecimiento no es válido o ya fue utilizado.
        </p>
        <Link
          href="/recuperar-password"
          className="inline-block w-full bg-cerise-600 text-white py-3.5 text-[12px] tracking-luxe font-semibold rounded-sm hover:bg-cerise-700 transition-colors text-center"
        >
          Solicitar nuevo enlace
        </Link>
      </div>
    );
  }

  // ── Success ──
  if (success) {
    return (
      <div className="w-full max-w-sm text-center">
        <Link href="/"><Image src="/aurora.png" alt="Aurora Belleza" width={90} height={28} className="mx-auto mb-10" /></Link>
        <div className="mb-6 mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-500">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-7">
            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
          </svg>
        </div>
        <h1 className="font-serif text-3xl mb-3 text-gray-900">¡Contraseña actualizada!</h1>
        <p className="text-gray-500 text-sm mb-8">
          Tu contraseña fue actualizada correctamente. Ya puedes ingresar con tu nueva contraseña.
        </p>
        <Link
          href="/login"
          className="inline-block w-full bg-cerise-600 text-white py-3.5 text-[12px] tracking-luxe font-semibold rounded-sm hover:bg-cerise-700 transition-colors text-center"
        >
          Ingresar
        </Link>
      </div>
    );
  }

  // ── Form ──
  return (
    <div className="w-full max-w-sm">
      <Link href="/"><Image src="/aurora.png" alt="Aurora Belleza" width={90} height={28} className="mb-10" /></Link>
      <h1 className="font-serif text-3xl md:text-4xl mb-2 text-gray-900">Nueva contraseña.</h1>
      <p className="text-gray-500 text-sm mb-10">
        Elige una contraseña segura para tu cuenta.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div>
          <label className="text-[11px] tracking-luxe font-medium text-gray-500 mb-1.5 block">
            Nueva contraseña
          </label>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value.replace(/\s/g, ""))}
              placeholder="Mínimo 8 caracteres"
              className={inputBase}
            />
            <button type="button" onClick={() => setShowNew((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cerise-600 transition-colors" aria-label="Mostrar contraseña">
              {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {newPassword && (
            <div className="mt-2 flex flex-wrap gap-2">
              {[
                { label: "8+ caracteres", valid: newPassword.length >= 8 },
                { label: "Una mayúscula", valid: /[A-Z]/.test(newPassword) },
                { label: "Una minúscula", valid: /[a-z]/.test(newPassword) },
                { label: "Un número", valid: /[0-9]/.test(newPassword) },
              ].map((check) => (
                <span key={check.label} className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${check.valid ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                  {check.valid ? "✓" : "○"} {check.label}
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="text-[11px] tracking-luxe font-medium text-gray-500 mb-1.5 block">
            Confirmar contraseña
          </label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value.replace(/\s/g, ""))}
              placeholder="Repite la contraseña"
              className={`${inputBase} ${confirm && newPassword && confirm !== newPassword ? "border-red-300 focus:border-red-400" : confirm && confirm === newPassword ? "border-green-300 focus:border-green-400" : ""}`}
            />
            <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cerise-600 transition-colors" aria-label="Mostrar contraseña">
              {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {confirm && newPassword && confirm !== newPassword && (
            <p className="mt-1.5 text-xs text-red-500">Las contraseñas no coinciden.</p>
          )}
          {confirm && confirm === newPassword && (
            <p className="mt-1.5 text-xs text-green-600">✓ Las contraseñas coinciden.</p>
          )}
        </div>

        {error && (
          <div className="bg-cerise-50 border border-cerise-100 rounded-sm px-4 py-2.5">
            <p className="text-sm text-cerise-700">{error}</p>
            {error.includes("expirado") && (
              <Link href="/recuperar-password" className="text-xs text-cerise-600 underline mt-1 block">
                Solicitar nuevo enlace →
              </Link>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-cerise-600 text-white py-3.5 text-[12px] tracking-luxe font-semibold rounded-sm hover:bg-cerise-700 transition-colors disabled:opacity-60"
        >
          {isPending ? "Guardando..." : "Guardar nueva contraseña"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Brand panel */}
      <div className="hidden lg:flex relative bg-blush items-center justify-center p-16">
        <div className="absolute top-8 left-8">
          <Link href="/"><Image src="/aurora.png" alt="Aurora Belleza" width={90} height={28} /></Link>
        </div>
        <div className="text-center max-w-md">
          <span className="text-cerise-600 text-[11px] font-semibold tracking-luxe mb-6 block">
            Seguridad de tu cuenta
          </span>
          <p className="font-serif text-3xl md:text-4xl leading-snug text-balance italic text-gray-800">
            "Tu privacidad es nuestra prioridad."
          </p>
          <p className="text-[11px] tracking-luxe text-gray-400 mt-8 font-medium">
            — Aurora Belleza
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-12 bg-white">
        <Suspense fallback={null}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
