"use client";
// =============================================================================
// components/admin/ProductBrandsCrudPanel.tsx
// CRUD de marcas de productos. Diseño consistente con CategoryManagementPanel.
// =============================================================================

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import type { ProductBrandRecord } from "@aurora/shared";
import {
  createProductBrandAction,
  updateProductBrandAction,
  toggleProductBrandActiveAction,
  deleteProductBrandAction,
} from "@/lib/actions/admin.product-brands.actions";

interface Props {
  brands: ProductBrandRecord[];
  productCounts: Record<string, number>;
}

export function ProductBrandsCrudPanel({ brands, productCounts }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [newName, setNewName] = useState("");
  const [newNameError, setNewNameError] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!newName.trim()) {
      setNewNameError("Escribe un nombre para la marca.");
      inputRef.current?.focus();
      return;
    }
    setNewNameError(null);
    startTransition(async () => {
      const result = await createProductBrandAction(newName.trim());
      if (result.error) { setError(result.error.message); return; }
      setNewName("");
      router.refresh();
    });
  }

  function handleUpdate(id: string) {
    setError(null);
    startTransition(async () => {
      const result = await updateProductBrandAction(id, editName.trim());
      if (result.error) { setError(result.error.message); return; }
      setEditId(null);
      router.refresh();
    });
  }

  function handleToggle(id: string, isActive: boolean) {
    setError(null);
    startTransition(async () => {
      const result = await toggleProductBrandActiveAction(id, !isActive);
      if (result.error) { setError(result.error.message); return; }
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    setError(null);
    startTransition(async () => {
      const result = await deleteProductBrandAction(id);
      if (result.error) { setError(result.error.message); return; }
      setDeleteConfirmId(null);
      router.refresh();
    });
  }

  const brandToDelete = deleteConfirmId ? brands.find((b) => b.id === deleteConfirmId) : null;
  const deleteCount = deleteConfirmId ? (productCounts[deleteConfirmId] ?? 0) : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Create form */}
      <div className="bg-white border border-gray-100 rounded-md p-6">
        <h3 className="font-serif text-xl text-gray-900 mb-1">Nueva marca</h3>
        <p className="text-xs text-gray-400 mb-4">
          Escribe el nombre y presiona "Crear". Se generará un slug automáticamente.
        </p>
        <form onSubmit={handleCreate} className="flex flex-col gap-3">
          <div>
            <input
              ref={inputRef}
              type="text"
              value={newName}
              onChange={(e) => { setNewName(e.target.value); setNewNameError(null); }}
              placeholder="Ej: L'Oréal, Maybelline, MAC Cosmetics..."
              maxLength={80}
              className={`w-full rounded-sm border px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 ${
                newNameError
                  ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                  : "border-gray-200 focus:border-cerise-400 focus:ring-cerise-100"
              }`}
            />
            {newNameError && (
              <p className="mt-1.5 text-xs text-red-500">⚠ {newNameError}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="self-start bg-cerise-600 text-white px-6 py-2.5 text-[12px] tracking-luxe font-semibold rounded-sm hover:bg-cerise-700 transition-colors disabled:opacity-60"
          >
            {isPending ? "Creando..." : "Crear marca"}
          </button>
        </form>
      </div>

      {/* Global error */}
      {error && (
        <div className="rounded-sm border border-red-100 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirmId && brandToDelete && (
        <div className="rounded-sm border border-red-200 bg-red-50 px-4 py-4">
          <p className="text-sm font-medium text-red-800 mb-1">
            ¿Eliminar "{brandToDelete.name}"?
          </p>
          {deleteCount > 0 ? (
            <p className="text-sm text-red-700 mb-3">
              Esta marca tiene <strong>{deleteCount}</strong> producto{deleteCount !== 1 ? "s" : ""} asociado{deleteCount !== 1 ? "s" : ""}.
              Debes reasignar o quitar la marca de esos productos antes de eliminarla.
            </p>
          ) : (
            <p className="text-sm text-red-700 mb-3">
              Esta acción es permanente y no se puede deshacer.
            </p>
          )}
          <div className="flex gap-3">
            {deleteCount === 0 && (
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={isPending}
                className="rounded-sm bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {isPending ? "Eliminando..." : "Sí, eliminar"}
              </button>
            )}
            <button
              onClick={() => setDeleteConfirmId(null)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Brand list */}
      <div className="bg-white border border-gray-100 rounded-md overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <p className="text-[11px] tracking-luxe text-gray-400 font-medium">
            {brands.length} marca{brands.length !== 1 ? "s" : ""}
          </p>
        </div>
        {brands.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-gray-400">
            Aún no hay marcas. Crea la primera arriba.
          </p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {brands.map((brand) => {
              const count = productCounts[brand.id] ?? 0;
              return (
                <li
                  key={brand.id}
                  className="flex flex-wrap items-center justify-between gap-y-2 gap-x-4 px-5 py-4 hover:bg-gray-50/50 transition-colors"
                >
                  {editId === brand.id ? (
                    <div className="flex flex-1 items-center gap-3">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        autoFocus
                        maxLength={80}
                        className="flex-1 rounded-sm border border-gray-200 px-3 py-2 text-sm focus:border-cerise-400 focus:outline-none focus:ring-1 focus:ring-cerise-100"
                      />
                      <button
                        onClick={() => handleUpdate(brand.id)}
                        disabled={isPending || !editName.trim()}
                        className="text-xs font-semibold text-cerise-600 hover:text-cerise-700 disabled:opacity-50"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => setEditId(null)}
                        className="text-xs text-gray-400 hover:text-gray-600"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-sm font-medium text-gray-800">{brand.name}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${brand.isActive ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                          {brand.isActive ? "Activa" : "Inactiva"}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {count} producto{count !== 1 ? "s" : ""}
                        </span>
                        <span className="text-[10px] text-gray-300 font-mono hidden sm:inline">
                          /{brand.slug}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <button
                          onClick={() => { setEditId(brand.id); setEditName(brand.name); }}
                          className="text-xs text-gray-400 hover:text-cerise-600 transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleToggle(brand.id, brand.isActive)}
                          disabled={isPending}
                          className={`text-xs font-medium transition-colors ${brand.isActive ? "text-amber-500 hover:text-amber-700" : "text-green-500 hover:text-green-700"}`}
                        >
                          {brand.isActive ? "Desactivar" : "Activar"}
                        </button>
                        <button
                          onClick={() => { setDeleteConfirmId(brand.id); setError(null); }}
                          className="text-xs text-red-400 hover:text-red-600 transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
