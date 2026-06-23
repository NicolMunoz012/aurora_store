"use client";
// =============================================================================
// components/admin/CategoryManagementPanel.tsx — Category CRUD panel
// Includes delete with confirmation + product count display.
// =============================================================================

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import type { CategoryRecord } from "@aurora/shared";
import {
  createCategoryAction,
  updateCategoryAction,
  toggleCategoryActiveAction,
  deleteCategoryAction,
} from "@/lib/actions/admin.catalog.actions";

interface Props {
  categories: CategoryRecord[];
  productCounts: Record<string, number>;
}

export function CategoryManagementPanel({ categories, productCounts }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [newName, setNewName] = useState("");
  const [newNameError, setNewNameError] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<{ categoryId: string; count: number } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!newName.trim()) {
      setNewNameError("Escribe un nombre para la categoría.");
      inputRef.current?.focus();
      return;
    }
    setNewNameError(null);
    startTransition(async () => {
      const result = await createCategoryAction({ name: newName.trim() });
      if (result.error) { setError(result.error.message); return; }
      setNewName("");
      router.refresh();
    });
  }

  function handleUpdate(categoryId: string) {
    setError(null);
    startTransition(async () => {
      const result = await updateCategoryAction(categoryId, { name: editName.trim() });
      if (result.error) { setError(result.error.message); return; }
      setEditId(null);
      router.refresh();
    });
  }

  function handleToggle(categoryId: string, isActive: boolean, confirmed = false) {
    setError(null);
    startTransition(async () => {
      const result = await toggleCategoryActiveAction(categoryId, !isActive, confirmed);
      if (result.error) { setError(result.error.message); return; }
      if (result.data?.warningCount) {
        setWarning({ categoryId, count: result.data.warningCount });
        return;
      }
      setWarning(null);
      router.refresh();
    });
  }

  function handleDelete(categoryId: string) {
    setError(null);
    startTransition(async () => {
      const result = await deleteCategoryAction(categoryId);
      if (result.error) { setError(result.error.message); return; }
      setDeleteConfirmId(null);
      router.refresh();
    });
  }

  const categoryToDelete = deleteConfirmId
    ? categories.find((c) => c.id === deleteConfirmId)
    : null;
  const deleteCount = deleteConfirmId ? (productCounts[deleteConfirmId] ?? 0) : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Create form */}
      <div className="bg-white border border-gray-100 rounded-md p-6">
        <h3 className="font-serif text-xl text-gray-900 mb-1">Nueva categoría</h3>
        <p className="text-xs text-gray-400 mb-4">Escribe el nombre y presiona "Crear".</p>
        <form onSubmit={handleCreate} className="flex flex-col gap-3">
          <div>
            <input
              ref={inputRef}
              type="text"
              value={newName}
              onChange={(e) => { setNewName(e.target.value); setNewNameError(null); }}
              placeholder="Nombre de la categoría..."
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
            {isPending ? "Creando..." : "Crear categoría"}
          </button>
        </form>
      </div>

      {/* Global error */}
      {error && (
        <div className="rounded-sm border border-red-100 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Toggle warning */}
      {warning && (
        <div className="rounded-sm border border-amber-200 bg-amber-50 px-4 py-4">
          <p className="text-sm text-amber-800 mb-3">
            ⚠️ Esta categoría tiene <strong>{warning.count}</strong> producto{warning.count !== 1 ? "s" : ""} asignado{warning.count !== 1 ? "s" : ""}.
            ¿Desactivarla de todas formas? Los productos permanecerán activos y sin categoría visible.
          </p>
          <div className="flex gap-3">
            <button onClick={() => handleToggle(warning.categoryId, true, true)} disabled={isPending} className="rounded-sm bg-amber-500 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-600">
              Sí, desactivar
            </button>
            <button onClick={() => setWarning(null)} className="text-xs text-gray-500 hover:text-gray-700">Cancelar</button>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirmId && categoryToDelete && (
        <div className="rounded-sm border border-red-200 bg-red-50 px-4 py-4">
          <p className="text-sm font-medium text-red-800 mb-1">
            ¿Eliminar "{categoryToDelete.name}"?
          </p>
          <p className="text-sm text-red-700 mb-3">
            {deleteCount > 0 ? (
              <>Esta categoría tiene <strong>{deleteCount}</strong> producto{deleteCount !== 1 ? "s" : ""}.
              Los productos <strong>permanecerán activos y publicados</strong>, pero quedarán sin categoría asignada.</>
            ) : (
              "Esta acción es permanente y no se puede deshacer."
            )}
          </p>
          <div className="flex gap-3">
            <button onClick={() => handleDelete(deleteConfirmId)} disabled={isPending} className="rounded-sm bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700">
              {isPending ? "Eliminando..." : "Sí, eliminar"}
            </button>
            <button onClick={() => setDeleteConfirmId(null)} className="text-xs text-gray-500 hover:text-gray-700">Cancelar</button>
          </div>
        </div>
      )}

      {/* Category list */}
      <div className="bg-white border border-gray-100 rounded-md overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <p className="text-[11px] tracking-luxe text-gray-400 font-medium">
            {categories.length} categoría{categories.length !== 1 ? "s" : ""}
          </p>
        </div>
        {categories.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-gray-400">
            Aún no hay categorías. Crea la primera arriba.
          </p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {categories.map((cat) => {
              const count = productCounts[cat.id] ?? 0;
              return (
                <li key={cat.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50/50 transition-colors">
                  {editId === cat.id ? (
                    <div className="flex flex-1 items-center gap-3">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        autoFocus
                        className="flex-1 rounded-sm border border-gray-200 px-3 py-2 text-sm focus:border-cerise-400 focus:outline-none focus:ring-1 focus:ring-cerise-100"
                      />
                      <button onClick={() => handleUpdate(cat.id)} disabled={isPending || !editName.trim()} className="text-xs font-semibold text-cerise-600 hover:text-cerise-700 disabled:opacity-50">
                        Guardar
                      </button>
                      <button onClick={() => setEditId(null)} className="text-xs text-gray-400 hover:text-gray-600">Cancelar</button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-sm font-medium text-gray-800">{cat.name}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${cat.isActive ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                          {cat.isActive ? "Activa" : "Inactiva"}
                        </span>
                        {count > 0 && (
                          <span className="text-[11px] text-gray-400">
                            {count} producto{count !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <button onClick={() => { setEditId(cat.id); setEditName(cat.name); }} className="text-xs text-gray-400 hover:text-cerise-600 transition-colors">
                          Editar
                        </button>
                        <button
                          onClick={() => handleToggle(cat.id, cat.isActive)}
                          disabled={isPending}
                          className={`text-xs font-medium transition-colors ${cat.isActive ? "text-amber-500 hover:text-amber-700" : "text-green-500 hover:text-green-700"}`}
                        >
                          {cat.isActive ? "Desactivar" : "Activar"}
                        </button>
                        <button
                          onClick={() => { setDeleteConfirmId(cat.id); setWarning(null); }}
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
