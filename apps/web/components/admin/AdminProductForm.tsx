"use client";
// =============================================================================
// components/admin/AdminProductForm.tsx (Req 16.1–16.9)
// Image upload via /api/upload. 1–5 images. Per-file error without blocking.
// =============================================================================

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Decimal } from "decimal.js";
import type { CategoryRecord, ProductImageRecord } from "@aurora/shared";
import { createProductAction, updateProductAction, toggleProductActiveAction } from "@/lib/actions/admin.catalog.actions";

interface AdminProductFormProps {
  categories: CategoryRecord[];
  mode: "create" | "edit";
  productId?: string;
  initialData?: {
    name: string;
    description: string;
    retailPrice: string;
    wholesalePrice: string;
    stock: number;
    lowStockAlert: number;
    minWholesaleQty?: number;
    categoryId: string;
    isActive: boolean;
    images: Pick<ProductImageRecord, "id" | "url" | "altText" | "displayOrder">[];
  };
}

interface UploadedImage {
  url: string;
  key: string;
  altText?: string;
}

export function AdminProductForm({
  categories,
  mode,
  productId,
  initialData,
}: AdminProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [retailPrice, setRetailPrice] = useState(initialData?.retailPrice ?? "");
  const [wholesalePrice, setWholesalePrice] = useState(initialData?.wholesalePrice ?? "");
  const [stock, setStock] = useState(initialData?.stock ?? 0);
  const [lowStockAlert, setLowStockAlert] = useState(initialData?.lowStockAlert ?? 5);
  const [minWholesaleQty, setMinWholesaleQty] = useState(initialData?.minWholesaleQty ?? 0);
  const [categoryId, setCategoryId] = useState(initialData?.categoryId ?? categories[0]?.id ?? "");
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

  // Images
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>(
    initialData?.images.map((img) => ({ url: img.url, key: img.url, altText: img.altText ?? "" })) ?? [],
  );
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    if (uploadedImages.length + files.length > 5) {
      setFormError("Máximo 5 imágenes por producto.");
      return;
    }

    setIsUploading(true);
    const newErrors: Record<string, string> = {};

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const json = await res.json() as { url?: string; key?: string; error?: string };
        if (!res.ok || !json.url) {
          newErrors[file.name] = json.error ?? "Error al subir archivo.";
        } else {
          setUploadedImages((prev) => [...prev, { url: json.url!, key: json.key! }]);
        }
      } catch {
        newErrors[file.name] = "Error de red al subir archivo.";
      }
    }

    setUploadErrors((prev) => ({ ...prev, ...newErrors }));
    setIsUploading(false);
    e.target.value = "";
  }

  function removeImage(index: number) {
    if (uploadedImages.length <= 1 && mode === "edit") {
      setFormError("Debe quedar al menos una imagen.");
      return;
    }
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (uploadedImages.length === 0) {
      setFormError("Debes subir al menos una imagen.");
      return;
    }

    startTransition(async () => {
      const data = {
        name,
        description: description || null,
        retailPrice: new Decimal(retailPrice),
        wholesalePrice: new Decimal(wholesalePrice),
        stock,
        lowStockAlert,
        minWholesaleQty: minWholesaleQty > 0 ? minWholesaleQty : null,
        categoryId,
        images: uploadedImages.map((img, i) => ({
          url: img.url,
          altText: img.altText ?? null,
          displayOrder: i,
        })),
      };

      if (mode === "create") {
        const result = await createProductAction(data);
        if (result.error) { setFormError(result.error.message); return; }
      } else if (mode === "edit" && productId) {
        const result = await updateProductAction(productId, data);
        if (result.error) { setFormError(result.error.message); return; }
      }

      router.push("/admin/productos");
    });
  }

  async function handleToggleActive() {
    if (!productId) return;
    startTransition(async () => {
      const result = await toggleProductActiveAction(productId, !isActive);
      if (!result.error) setIsActive((v) => !v);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {[
        { id: "name", label: "Nombre *", type: "text", value: name, set: setName },
        { id: "retailPrice", label: "Precio retail (COP) *", type: "number", value: retailPrice, set: setRetailPrice },
        { id: "wholesalePrice", label: "Precio mayorista (COP) *", type: "number", value: wholesalePrice, set: setWholesalePrice },
      ].map(({ id, label, type, value, set }) => (
        <div key={id}>
          <label htmlFor={id} className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</label>
          <input
            id={id}
            type={type}
            value={value}
            onChange={(e) => set(e.target.value)}
            required
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
          />
        </div>
      ))}

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Descripción</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label htmlFor="stock" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Stock</label>
          <input id="stock" type="number" min={0} value={stock} onChange={(e) => setStock(Number(e.target.value))} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white" />
        </div>
        <div>
          <label htmlFor="lowStock" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Alerta stock</label>
          <input id="lowStock" type="number" min={0} value={lowStockAlert} onChange={(e) => setLowStockAlert(Number(e.target.value))} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white" />
        </div>
        <div>
          <label htmlFor="minWholesale" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Min. mayorista</label>
          <input id="minWholesale" type="number" min={0} value={minWholesaleQty} onChange={(e) => setMinWholesaleQty(Number(e.target.value))} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white" />
        </div>
      </div>

      <div>
        <label htmlFor="category" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Categoría *</label>
        <select id="category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white">
          {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
        </select>
      </div>

      {/* Images */}
      <div>
        <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Imágenes (1–5, JPG/PNG/WebP, máx. 2 MB)
        </p>
        <div className="flex flex-wrap gap-2 mb-2">
          {uploadedImages.map((img, i) => (
            <div key={img.key + i} className="relative h-16 w-16 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-600">
              <img src={img.url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute right-0.5 top-0.5 rounded-full bg-red-500 p-0.5 text-[10px] text-white"
                aria-label="Eliminar imagen"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        {Object.entries(uploadErrors).map(([fname, err]) => (
          <p key={fname} className="mb-1 text-xs text-red-500">{fname}: {err}</p>
        ))}
        {uploadedImages.length < 5 && (
          <label className="cursor-pointer text-sm text-zinc-500 underline">
            {isUploading ? "Subiendo..." : "Subir imagen"}
            <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={handleFileChange} disabled={isUploading} />
          </label>
        )}
      </div>

      {formError && <p className="text-sm text-red-500">{formError}</p>}

      <div className="flex items-center justify-between">
        {mode === "edit" && productId && (
          <button
            type="button"
            onClick={handleToggleActive}
            disabled={isPending}
            className={`rounded-full px-4 py-2 text-xs font-semibold ${isActive ? "bg-zinc-200 text-zinc-700 hover:bg-zinc-300" : "bg-green-100 text-green-700 hover:bg-green-200"}`}
          >
            {isActive ? "Desactivar producto" : "Activar producto"}
          </button>
        )}
        <button
          type="submit"
          disabled={isPending || isUploading}
          className="ml-auto rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-white dark:text-zinc-900"
        >
          {isPending ? "Guardando..." : mode === "create" ? "Crear producto" : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
