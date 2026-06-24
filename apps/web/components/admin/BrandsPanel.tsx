"use client";
// =============================================================================
// components/admin/BrandsPanel.tsx — Brand logo manager (5 slots)
// =============================================================================

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { BrandRecord } from "@/lib/actions/admin.brands.actions";
import { saveBrandsAction } from "@/lib/actions/admin.brands.actions";

interface SlotBrand {
  imageUrl: string;
  imageKey: string;
}

const MAX_BRANDS = 5;

export function BrandsPanel({ initialBrands }: { initialBrands: BrandRecord[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [slots, setSlots] = useState<(SlotBrand | null)[]>(() => {
    const arr: (SlotBrand | null)[] = Array(MAX_BRANDS).fill(null);
    initialBrands.slice(0, MAX_BRANDS).forEach((b, i) => {
      arr[i] = { imageUrl: b.imageUrl, imageKey: b.imageKey };
    });
    return arr;
  });
  const [uploading, setUploading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleUpload(index: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp", "image/svg+xml"].includes(file.type)) {
      setError("Formato no permitido. Usa JPG, PNG, WebP o SVG.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("El archivo supera el tamaño máximo de 2 MB.");
      return;
    }

    setError(null);
    setUploading(index);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const json = await res.json() as { url?: string; key?: string; error?: string };
      if (!res.ok || !json.url) throw new Error(json.error ?? "Error al subir");
      setSlots((prev) => {
        const next = [...prev];
        next[index] = { imageUrl: json.url!, imageKey: json.key! };
        return next;
      });
    } catch {
      setError("No se pudo subir la imagen. Intenta de nuevo.");
    } finally {
      setUploading(null);
      e.target.value = "";
    }
  }

  function removeSlot(index: number) {
    setSlots((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  }

  function handleSave() {
    setError(null);
    setSuccess(false);
    const toSave = slots
      .map((s, i) => s ? { imageUrl: s.imageUrl, imageKey: s.imageKey, order: i } : null)
      .filter(Boolean) as { imageUrl: string; imageKey: string; order: number }[];

    startTransition(async () => {
      const result = await saveBrandsAction(toSave);
      if (result.error) { setError(result.error.message); return; }
      setSuccess(true);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white border border-gray-100 rounded-md p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {slots.map((slot, i) => (
            <div key={i} className="flex flex-col gap-2">
              <p className="text-[11px] tracking-luxe text-gray-400 text-center">Marca {i + 1}</p>
              <div className="aspect-[3/2] rounded-md border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center relative">
                {slot ? (
                  <Image
                    src={slot.imageUrl}
                    alt={`Marca ${i + 1}`}
                    fill
                    className="object-contain p-3"
                  />
                ) : (
                  <div className="text-gray-300 text-xs text-center p-2">
                    {uploading === i ? (
                      <span className="text-cerise-400">Subiendo...</span>
                    ) : (
                      "Sin imagen"
                    )}
                  </div>
                )}
              </div>
              <label className="cursor-pointer text-center text-xs font-medium text-cerise-600 hover:text-cerise-700 transition-colors">
                {slot ? "Cambiar" : "Subir imagen"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  className="sr-only"
                  onChange={(e) => handleUpload(i, e)}
                  disabled={uploading !== null}
                />
              </label>
              {slot && (
                <button
                  onClick={() => removeSlot(i)}
                  className="text-xs text-red-400 hover:text-red-600 transition-colors text-center"
                >
                  Eliminar
                </button>
              )}
            </div>
          ))}
        </div>

        <p className="text-[11px] text-gray-400 mt-5 flex items-center gap-1.5">
          <span className="text-cerise-400">ⓘ</span>
          Puedes subir hasta 5 marcas. Se mostrarán en el orden establecido.
        </p>
      </div>

      {error && (
        <div className="rounded-sm border border-red-100 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      {success && (
        <div className="rounded-sm border border-green-100 bg-green-50 px-4 py-3">
          <p className="text-sm text-green-600">✓ Marcas guardadas correctamente.</p>
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={isPending || uploading !== null}
        className="self-start bg-cerise-600 text-white px-6 py-2.5 text-[12px] tracking-luxe font-semibold rounded-sm hover:bg-cerise-700 transition-colors disabled:opacity-60"
      >
        {isPending ? "Guardando..." : "Guardar cambios"}
      </button>
    </div>
  );
}
