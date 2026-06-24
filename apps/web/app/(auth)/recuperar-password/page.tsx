"use client";
// =============================================================================
// app/(auth)/recuperar-password/page.tsx — Password reset request
// Always shows same confirmation to avoid email enumeration.
// =============================================================================

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { requestPasswordResetAction } from "@/lib/actions/auth.actions";

export default function RecuperarPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await requestPasswordResetAction(email);
      setSubmitted(true);
    });
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Brand panel */}
      <div className="hidden lg:flex relative bg-blush items-center justify-center p-16">
        <div className="absolute top-8 left-8">
          <Image src="/aurora.png" alt="Aurora Belleza" width={90} height={28} />
        </div>
        <div className="text-center max-w-md">
          <span className="text-cerise-600 text-[11px] font-semibold tracking-luxe mb-6 block">
            Recupera tu acceso
          </span>
          <p className="font-serif text-3xl md:text-4xl leading-snug text-balance italic text-gray-800">
            "Tu ritual de belleza te espera."
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

          {submitted ? (
            <div>
              <h1 className="font-serif text-3xl md:text-4xl mb-4">Revisa tu correo.</h1>
              <p className="text-gray-500 text-sm mb-8">
                Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.
              </p>
              <Link
                href="/login"
                className="block text-center w-full bg-cerise-600 text-white py-3.5 text-[12px] tracking-luxe font-semibold rounded-sm hover:bg-cerise-700 transition-colors"
              >
                Volver a ingresar
              </Link>
            </div>
          ) : (
            <>
              <h1 className="font-serif text-3xl md:text-4xl mb-2">¿Olvidaste tu contraseña?</h1>
              <p className="text-gray-500 text-sm mb-10">
                Ingresa tu correo y te enviaremos un enlace para restablecerla.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div>
                  <label className="text-[11px] tracking-luxe font-medium text-gray-500 mb-1.5 block">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-cerise-400 transition-colors"
                    placeholder="correo@ejemplo.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-cerise-600 text-white py-3.5 text-[12px] tracking-luxe font-semibold rounded-sm hover:bg-cerise-700 transition-colors disabled:opacity-60"
                >
                  {isPending ? "Enviando..." : "Enviar enlace de recuperación"}
                </button>
              </form>

              <p className="mt-8 text-center text-sm text-gray-500">
                ¿Recordaste tu contraseña?{" "}
                <Link href="/login" className="text-cerise-600 font-medium hover:underline">
                  Ingresar
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
