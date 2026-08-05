"use client";
// =============================================================================
// components/admin/BrandSettingsPanel.tsx
// Admin panel section for managing primary and secondary logos.
// Follows the same upload pattern as BrandsPanel.tsx.
// =============================================================================

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { updateBrandingAction } from "@/lib/actions/admin.store-config.actions";
import type { SerializedStoreConfig } from "@/lib/actions/admin.store-config.actions";
import { Upload, X, ImageIcon } from "lucide-react";

interface LogoSlot {
  url: string;
  key: string;
}

interface LogoUploadFieldProps {
  label: string;
  description: string;
  hint: string;
  slot: LogoSlot | null;
  uploading: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  id: string;
}

function LogoUploadField({
  label,
  description,
  hint,
  slot,
  uploading,
  onUpload,
  onRemove,
  id,
}: LogoUploadFieldProps) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        <p className="text-[11px] tracking-luxe text-gray-400 mt-0.5">{description}</p>
      </div>

      <div className="flex items-center gap-5">
        {/* Preview box */}
        <div className="relative flex-shrink-0 w-40 h-16 rounded-md border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center">
          {uploading ? (
            <span className="text-[11px] text-cerise-500 animate-pulse">Subiendo…</span>
          ) : slot ? (
            <>
              <Image
                src={slot.url}
                alt={label}
                fill
                className="object-contain p-2"
                unoptimized
              />
              <button
                type="button"
                onClick={onRemove}
                className="absolute top-1 right-1 p-0.5 rounded-full bg-white/90 border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors"
                aria-label={`Eliminar ${label}`}
              >
                <X className="size-3" />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-1 text-gray-300">
              <ImageIcon className="size-5" />
              <span className="text-[10px]">Sin logo</span>
            </div>
          )}
        </div>

        {/* Upload button */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor={id}
            className={`inline-flex items-center gap-2 cursor-pointer px-4 py-2 text-[11px] tracking-luxe font-semibold rounded-sm border transition-colors ${
              uploading
                ? "border-gray-200 text-gray-300 cursor-not-allowed"
                : "border-cerise-200 text-cerise-600 hover:bg-cerise-50 hover:border-cerise-300"
            }`}
          >
            <Upload className="size-3.5" />
            {slot ? "Cambiar logo" : "Subir logo"}
            <input
              id={id}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/svg+xml"
              className="sr-only"
              onChange={onUpload}
              disabled={uploading}
            />
          </label>
          <p className="text-[10px] text-gray-400">{hint}</p>
        </div>
      </div>
    </div>
  );
}

interface BrandSettingsPanelProps {
  initialConfig: SerializedStoreConfig;
}

export function BrandSettingsPanel({ initialConfig }: BrandSettingsPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [primary, setPrimary] = useState<LogoSlot | null>(
    initialConfig.primaryLogoUrl
      ? { url: initialConfig.primaryLogoUrl, key: initialConfig.primaryLogoKey ?? "" }
      : null,
  );
  const [secondary, setSecondary] = useState<LogoSlot | null>(
    initialConfig.secondaryLogoUrl
      ? { url: initialConfig.secondaryLogoUrl, key: initialConfig.secondaryLogoKey ?? "" }
      : null,
  );

  const [uploadingPrimary, setUploadingPrimary] = useState(false);
  const [uploadingSecondary, setUploadingSecondary] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleUpload(
    field: "primary" | "secondary",
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
    if (!allowed.includes(file.type)) {
      setError("Formato no permitido. Usa JPG, PNG, WebP o SVG.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("El archivo supera el tamaño máximo de 2 MB.");
      return;
    }

    setError(null);
    setSuccess(false);
    if (field === "primary") setUploadingPrimary(true);
    else setUploadingSecondary(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const json = (await res.json()) as { url?: string; key?: string; error?: string };
      if (!res.ok || !json.url) throw new Error(json.error ?? "Error al subir");

      const slot: LogoSlot = { url: json.url!, key: json.key! };
      if (field === "primary") setPrimary(slot);
      else setSecondary(slot);
    } catch {
      setError("No se pudo subir la imagen. Intenta de nuevo.");
    } finally {
      if (field === "primary") setUploadingPrimary(false);
      else setUploadingSecondary(false);
      e.target.value = "";
    }
  }

  function handleSave() {
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const result = await updateBrandingAction({
        primaryLogoUrl: primary?.url ?? null,
        primaryLogoKey: primary?.key ?? null,
        secondaryLogoUrl: secondary?.url ?? null,
        secondaryLogoKey: secondary?.key ?? null,
      });

      if (result.error) {
        setError(result.error.message);
        return;
      }

      setSuccess(true);
      router.refresh();
    });
  }

  const isBusy = isPending || uploadingPrimary || uploadingSecondary;

  return (
    <div className="flex flex-col gap-8">
      {/* Primary Logo */}
      <LogoUploadField
        id="primary-logo-upload"
        label="Logo principal (Wordmark)"
        description="Usado en el footer, páginas de login, emails e invoices — versión completa con texto."
        hint="Recomendado: SVG o PNG transparente · Máx. 2 MB"
        slot={primary}
        uploading={uploadingPrimary}
        onUpload={(e) => handleUpload("primary", e)}
        onRemove={() => setPrimary(null)}
      />

      <div className="border-t border-gray-100" />

      {/* Secondary Logo */}
      <LogoUploadField
        id="secondary-logo-upload"
        label="Logo secundario (Ícono)"
        description="Usado en la barra de navegación, menú móvil y panel de administración — versión compacta."
        hint="Recomendado: SVG, PNG o WebP transparente · Máx. 2 MB"
        slot={secondary}
        uploading={uploadingSecondary}
        onUpload={(e) => handleUpload("secondary", e)}
        onRemove={() => setSecondary(null)}
      />

      {/* Feedback */}
      {error && (
        <div className="rounded-sm border border-red-100 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      {success && (
        <div className="rounded-sm border border-emerald-100 bg-emerald-50 px-4 py-3">
          <p className="text-sm text-emerald-700">✓ Logos guardados. Los cambios son visibles de inmediato.</p>
        </div>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={isBusy}
        className="self-start bg-cerise-600 text-white px-6 py-3 text-[12px] tracking-luxe font-semibold rounded-sm hover:bg-cerise-700 transition-colors disabled:opacity-60"
      >
        {isPending ? "Guardando…" : "Guardar logos"}
      </button>
    </div>
  );
}
