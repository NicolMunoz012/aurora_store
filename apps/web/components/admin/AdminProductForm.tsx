"use client";
// =============================================================================
// components/admin/AdminProductForm.tsx — Product create/edit form
// Image upload via /api/upload. 1–5 images. Per-file error without blocking.
// =============================================================================

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Decimal } from "decimal.js";
import type { CategoryRecord, ProductImageRecord } from "@aurora/shared";
import {
  createProductAction,
  updateProductAction,
  toggleProductActiveAction,
} from "@/lib/actions/admin.catalog.actions";
import { DISCOUNT_PERCENTAGES, getDiscountedPrice, getSavings, formatCOP } from "@/lib/discount";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

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
    discountPercentage?: number | null;
    brand?: string | null;
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
  const [discountPercentage, setDiscountPercentage] = useState<number | null>(initialData?.discountPercentage ?? null);
  const [brand, setBrand] = useState(initialData?.brand ?? "");

  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>(
    initialData?.images.map((img) => ({ url: img.url, key: img.url, altText: img.altText ?? "" })) ?? [],
  );
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [pendingNavHref, setPendingNavHref] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Mark dirty on any field change
  function markDirty() { setIsDirty(true); }

  // Warn on browser close when dirty
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  // Intercept sidebar / any link click when dirty
  useEffect(() => {
    if (!isDirty) return;
    function handleClick(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest("a[href]");
      if (!target) return;
      const href = (target as HTMLAnchorElement).getAttribute("href");
      if (!href || href === "#") return;
      // Only intercept admin nav links
      if (href.startsWith("/admin") && href !== window.location.pathname) {
        e.preventDefault();
        setPendingNavHref(href);
        setShowCancelDialog(true);
      }
    }
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [isDirty]);

  // ── Back-button interception via History API sentinel ──────────────────────
  // When the form becomes dirty we push a "sentinel" history entry so that
  // pressing the back button fires a popstate event instead of navigating away.
  // If the user confirms leaving, we pop the sentinel and navigate.
  // If they cancel, we re-push the sentinel so the next press is also caught.
  const sentinelPushed = useRef(false);

  useEffect(() => {
    if (isDirty && !sentinelPushed.current) {
      history.pushState({ sentinel: true }, "");
      sentinelPushed.current = true;
    }
  }, [isDirty]);

  useEffect(() => {
    if (!isDirty) return;

    function handlePopState(e: PopStateEvent) {
      // Only act when the sentinel was popped (state is NOT sentinel anymore)
      if (e.state?.sentinel) return; // just arrived at sentinel — nothing to do
      // The sentinel was consumed: show the dialog and re-push it
      history.pushState({ sentinel: true }, ""); // restore sentinel
      setPendingNavHref(null); // null = go back after confirm
      setShowCancelDialog(true);
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isDirty]);
  // ──────────────────────────────────────────────────────────────────────────

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
        const json = (await res.json()) as { url?: string; key?: string; error?: string };
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
        retailPrice,     // string — converted to Decimal in the server action
        wholesalePrice,  // string — converted to Decimal in the server action
        stock,
        lowStockAlert,
        minWholesaleQty: minWholesaleQty > 0 ? minWholesaleQty : null,
        discountPercentage,
        brand: brand.trim() || null,
        categoryId: categoryId || null,
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
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Name */}
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-700">
          Nombre del producto *
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); markDirty(); }}
          required
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-sm transition-all focus:border-cerise-300 focus:outline-none focus:ring-2 focus:ring-cerise-100"
        />
      </div>

      {/* Brand */}
      <div>
        <label htmlFor="brand" className="mb-1.5 block text-sm font-medium text-gray-700">
          Marca <span className="text-gray-400 font-normal">(opcional)</span>
        </label>
        <input
          id="brand"
          type="text"
          maxLength={60}
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          placeholder="Ej: Maybelline, MAC, L'Oréal"
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-sm transition-all focus:border-cerise-300 focus:outline-none focus:ring-2 focus:ring-cerise-100"
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-gray-700">
          Descripción
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => { setDescription(e.target.value); markDirty(); }}
          rows={3}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-sm transition-all focus:border-cerise-300 focus:outline-none focus:ring-2 focus:ring-cerise-100"
        />
      </div>

      {/* Prices */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="retailPrice" className="mb-1.5 block text-sm font-medium text-gray-700">
            Precio detal (COP) *
          </label>
          <input
            id="retailPrice"
            type="number"
            min="0"
            step="100"
            value={retailPrice}
            onChange={(e) => setRetailPrice(e.target.value)}
            required
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-sm transition-all focus:border-cerise-300 focus:outline-none focus:ring-2 focus:ring-cerise-100"
          />
        </div>
        <div>
          <label htmlFor="wholesalePrice" className="mb-1.5 block text-sm font-medium text-gray-700">
            Precio mayorista (COP) *
          </label>
          <input
            id="wholesalePrice"
            type="number"
            min="0"
            step="100"
            value={wholesalePrice}
            onChange={(e) => setWholesalePrice(e.target.value)}
            required
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-sm transition-all focus:border-cerise-300 focus:outline-none focus:ring-2 focus:ring-cerise-100"
          />
        </div>
      </div>

      {/* Stock & Alerts */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label htmlFor="stock" className="mb-1.5 block text-sm font-medium text-gray-700">Stock</label>
          <input
            id="stock"
            type="number"
            min={0}
            value={stock}
            onChange={(e) => setStock(Number(e.target.value))}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-sm transition-all focus:border-cerise-300 focus:outline-none focus:ring-2 focus:ring-cerise-100"
          />
        </div>
        <div>
          <label htmlFor="lowStock" className="mb-1.5 block text-sm font-medium text-gray-700">Alerta stock</label>
          <input
            id="lowStock"
            type="number"
            min={0}
            value={lowStockAlert}
            onChange={(e) => setLowStockAlert(Number(e.target.value))}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-sm transition-all focus:border-cerise-300 focus:outline-none focus:ring-2 focus:ring-cerise-100"
          />
        </div>
        <div>
          <label htmlFor="minWholesale" className="mb-1.5 block text-sm font-medium text-gray-700">Min. mayorista</label>
          <input
            id="minWholesale"
            type="number"
            min={0}
            value={minWholesaleQty}
            onChange={(e) => setMinWholesaleQty(Number(e.target.value))}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-sm transition-all focus:border-cerise-300 focus:outline-none focus:ring-2 focus:ring-cerise-100"
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="mb-1.5 block text-sm font-medium text-gray-700">Categoría *</label>
        <select
          id="category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-sm transition-all focus:border-cerise-300 focus:outline-none focus:ring-2 focus:ring-cerise-100"
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Promotion */}
      <div className="bg-blush-soft border border-gray-100 rounded-md p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-lg text-gray-900">Promoción</h3>
          <button
            type="button"
            onClick={() => setDiscountPercentage(discountPercentage ? null : 5)}
            className={`text-[11px] tracking-luxe font-semibold px-3 py-1 rounded-full transition-colors ${
              discountPercentage
                ? "bg-cerise-600 text-white"
                : "bg-gray-200 text-gray-500 hover:bg-gray-300"
            }`}
          >
            {discountPercentage ? "Activa" : "Sin promoción"}
          </button>
        </div>

        {discountPercentage !== null && (
          <>
            <div className="flex flex-wrap gap-2 mb-4">
              {DISCOUNT_PERCENTAGES.map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setDiscountPercentage(pct)}
                  className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${
                    discountPercentage === pct
                      ? "bg-cerise-600 text-white"
                      : "bg-white border border-gray-200 text-gray-600 hover:border-cerise-300 hover:text-cerise-600"
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>

            {retailPrice && (
              <div className="bg-white border border-gray-100 rounded-sm p-4 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Precio original</span>
                  <span>{formatCOP(retailPrice)}</span>
                </div>
                <div className="flex justify-between text-gray-500 mt-1">
                  <span>Descuento ({discountPercentage}%)</span>
                  <span>-{formatCOP(getSavings(parseFloat(retailPrice), discountPercentage))}</span>
                </div>
                <div className="flex justify-between font-semibold text-gray-900 mt-2 pt-2 border-t border-gray-100">
                  <span>Precio final</span>
                  <span className="text-cerise-600">{formatCOP(getDiscountedPrice(parseFloat(retailPrice), discountPercentage))}</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Images */}
      <div>
        <p className="mb-2 text-sm font-medium text-gray-700">
          Imágenes ({uploadedImages.length}/5) — JPG, PNG o WebP, máx. 2 MB
        </p>
        <div className="flex flex-wrap gap-3 mb-3">
          {uploadedImages.map((img, i) => (
            <div key={img.key + i} className="relative h-20 w-20 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
              <img src={img.url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm hover:bg-red-600"
                aria-label="Eliminar imagen"
              >
                ✕
              </button>
            </div>
          ))}
          {uploadedImages.length < 5 && (
            <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-gray-200 text-gray-400 transition-colors hover:border-cerise-300 hover:text-cerise-500">
              {isUploading ? (
                <span className="text-xs">...</span>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-6 w-6">
                  <path d="M10 5a1 1 0 0 1 1 1v3h3a1 1 0 1 1 0 2h-3v3a1 1 0 1 1-2 0v-3H6a1 1 0 1 1 0-2h3V6a1 1 0 0 1 1-1Z" />
                </svg>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="sr-only"
                onChange={handleFileChange}
                disabled={isUploading}
              />
            </label>
          )}
        </div>
        {Object.entries(uploadErrors).map(([fname, err]) => (
          <p key={fname} className="mb-1 text-xs text-red-500">{fname}: {err}</p>
        ))}
      </div>

      {/* Error */}
      {formError && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-600">{formError}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => { setPendingNavHref("/admin/productos"); setShowCancelDialog(true); }}
            className="rounded-full px-4 py-2 text-xs font-semibold text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700 transition-colors"
          >
            Cancelar
          </button>
          {mode === "edit" && productId && (
            <button
              type="button"
              onClick={handleToggleActive}
              disabled={isPending}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                isActive
                  ? "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600"
                  : "bg-green-50 text-green-700 hover:bg-green-100"
              }`}
            >
              {isActive ? "Desactivar producto" : "Activar producto"}
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={isPending || isUploading}
          className="rounded-full bg-cerise-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-cerise-600 hover:shadow-md disabled:opacity-60"
        >
          {isPending ? "Guardando..." : mode === "create" ? "Crear producto" : "Guardar cambios"}
        </button>
      </div>
    </form>

    <ConfirmDialog
      open={showCancelDialog}
      title="¿Salir sin guardar?"
      message="Los cambios que hiciste no se guardarán si sales ahora."
      confirmLabel="Sí, salir"
      cancelLabel="Quedarme"
      onConfirm={() => {
        setShowCancelDialog(false);
        setIsDirty(false);
        sentinelPushed.current = false;
        if (pendingNavHref) {
          // Pop the sentinel entry before navigating forward
          history.back();
          // Small delay so the sentinel pop completes before the push
          setTimeout(() => router.push(pendingNavHref!), 50);
        } else {
          // Back button was pressed — pop sentinel then let browser go back
          history.go(-2); // -1 was already restored by handlePopState, go one more
        }
      }}
      onCancel={() => { setShowCancelDialog(false); setPendingNavHref(null); }}
    />
    </>
  );
}
