"use client";
// =============================================================================
// components/client/ProfileForm.tsx — Profile edit form (editorial style)
// =============================================================================

import { useState, useTransition } from "react";
import type { UserProfile } from "@aurora/shared";
import { updateProfileAction } from "@/lib/actions/user.actions";

export function ProfileForm({ profile }: { profile: UserProfile }) {
  const [fullName, setFullName] = useState(profile.fullName);
  const [email, setEmail] = useState(profile.email);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await updateProfileAction({ fullName, email });
      if (result.error) {
        setError(result.error.code === "EMAIL_ALREADY_IN_USE"
          ? "El correo ya está registrado en otra cuenta."
          : result.error.message);
      } else {
        setSuccess(true);
      }
    });
  }

  const inputClass = "w-full px-4 py-3 bg-white border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-cerise-400 transition-colors";
  const labelClass = "text-[11px] tracking-luxe font-medium text-gray-500 mb-1.5 block";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="fullName" className={labelClass}>Nombre completo</label>
        <input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="email" className={labelClass}>Correo electrónico</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </div>
      {error && (
        <div className="bg-cerise-50 border border-cerise-100 rounded-sm px-4 py-2.5">
          <p className="text-sm text-cerise-700">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-100 rounded-sm px-4 py-2.5">
          <p className="text-sm text-green-600">✓ Perfil actualizado correctamente.</p>
        </div>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="bg-cerise-600 text-white px-6 py-2.5 text-[12px] tracking-luxe font-semibold rounded-sm hover:bg-cerise-700 transition-colors disabled:opacity-60"
      >
        {isPending ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}
