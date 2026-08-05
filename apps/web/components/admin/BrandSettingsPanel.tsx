"use client";
// =============================================================================
// components/admin/BrandSettingsPanel.tsx
// Admin panel section for managing the store logo.
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

interface BrandSettingsPanelProps {
  initialConfig: SerializedStoreConfig;
}

export function BrandSettingsPanel({ initialConfig }: BrandSettingsPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [logo, setLogo] = useState<LogoSlot | null>(
    initialConfig.logoUrl
      ? { url: initialConfig.logoUrl, key: initialConfig.logoKey ?? "" }
      : null,
  );

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
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
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const json = (await res.json()) as { url?: string; key?: string; error?: string };
      if (!res.ok || !json.url) throw new Error(json.error ?? "Error al subir");
      setLogo({ url: json.url!, key: json.key! });
    } catch {
      setError("No se pudo subir la imagen. Intenta de nuevo.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function handleSave() {
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const result = await updateBrandingAction({
        logoUrl: logo?.url ?? null,
        logoKey: logo?.key ?? null,
      });

      if (result.error) {
        setError(result.error.message);
        return;
      }

      setSuccess(true);
      router.refresh();
    });
  }

  const isBusy = isPending || uploading;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-5">
        {/* Preview box */}
        <div className="relative flex-shrink-0 w-44 h-20 rounded-md border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center">
          {uploading ? (
            <span className="text-[11px] text-cerise-500 animate-pulse">Subiendo…</span>
          ) : logo ? (
            <>
              <Image
                src={logo.url}
                alt="Logo de la tienda"
                fill
                className="object-contain p-3"
                unoptimized
              />
              <button
                type="button"
                onClick={() => setLogo(null)}
                className="absolute top-1 right-1 p-0.5 rounded-full bg-white/90 border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors"
                aria-label="Eliminar logo"
              >
                <X className="size-3" />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-1 text-gray-300">
              <ImageIcon className="size-6" />
              <span className="text-[10px]">Sin logo</span>
            </div>
          )}
        </div>

        {/* Upload button */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="logo-upload"
            className={`inline-flex items-center gap-2 cursor-pointer px-4 py-2 text-[11px] tracking-luxe font-semibold rounded-sm border transition-colors ${
              uploading
                ? "border-gray-200 text-gray-300 cursor-not-allowed"
                : "border-cerise-200 text-cerise-600 hover:bg-cerise-50 hover:border-cerise-300"
            }`}
          >
            <Upload className="size-3.5" />
            {logo ? "Cambiar logo" : "Subir logo"}
            <input
              id="logo-upload"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/svg+xml"
              className="sr-only"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
          <p className="text-[10px] text-gray-400">SVG, PNG o WebP transparente · Máx. 2 MB</p>
        </div>
      </div>

      {/* Feedback */}
      {error && (
        <div className="rounded-sm border border-red-100 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      {success && (
        <div className="rounded-sm border border-emerald-100 bg-emerald-50 px-4 py-3">
          <p className="text-sm text-emerald-700">✓ Logo guardado. Los cambios son visibles de inmediato.</p>
        </div>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={isBusy}
        className="self-start bg-cerise-600 text-white px-6 py-3 text-[12px] tracking-luxe font-semibold rounded-sm hover:bg-cerise-700 transition-colors disabled:opacity-60"
      >
        {isPending ? "Guardando…" : "Guardar logo"}
      </button>
    </div>
  );
}
