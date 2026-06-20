"use client";
// =============================================================================
// components/admin/CategoryManagementPanel.tsx — Category CRUD panel
// =============================================================================

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { CategoryRecord } from "@aurora/shared";
import {
  createCategoryAction,
  updateCategoryAction,
  toggleCategoryActiveAction,
} from "@/lib/actions/admin.catalog.actions";

export function CategoryManagementPanel({ categories }: { categories: CategoryRecord[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [newName, setNewName] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<{ categoryId: string; count: number } | null>(null);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createCategoryAction({ name: newName });
      if (result.error) { setError(result.error.message); return; }
      setNewName("");
      router.refresh();
    });
  }

  function handleUpdate(categoryId: string) {
    setError(null);
    startTransition(async () => {
      const result = await updateCategoryAction(categoryId, { name: editName });
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

  return (
    <div className="flex flex-col gap-6">
      {/* Create form */}
      <form onSubmit={handleCreate} className="flex gap-3">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nombre de nueva categoría..."
          required
          className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-sm transition-all focus:border-cerise-300 focus:outline-none focus:ring-2 focus:ring-cerise-100"
        />
        <button
          type="submit"
          disabled={isPending || !newName.trim()}
          className="rounded-full bg-cerise-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-cerise-600 hover:shadow-md disabled:opacity-60"
        >
          Crear
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Warning confirmation */}
      {warning && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm text-amber-800">
            ⚠️ Esta categoría tiene <strong>{warning.count}</strong> producto{warning.count !== 1 ? "s" : ""} activo{warning.count !== 1 ? "s" : ""}.
            ¿Deseas desactivarla de todas formas?
          </p>
          <div className="mt-3 flex gap-3">
            <button
              onClick={() => handleToggle(warning.categoryId, true, true)}
              disabled={isPending}
              className="rounded-full bg-amber-500 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-amber-600"
            >
              Sí, desactivar
            </button>
            <button
              onClick={() => setWarning(null)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Category list */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {categories.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-gray-400">
            No hay categorías creadas.
          </p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {categories.map((cat) => (
              <li key={cat.id} className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-gray-50">
                {editId === cat.id ? (
                  <div className="flex flex-1 items-center gap-3">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      autoFocus
                      className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-cerise-300 focus:outline-none focus:ring-2 focus:ring-cerise-100"
                    />
                    <button
                      onClick={() => handleUpdate(cat.id)}
                      disabled={isPending || !editName.trim()}
                      className="text-xs font-medium text-cerise-600 hover:text-cerise-700"
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
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-800">{cat.name}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        cat.isActive
                          ? "bg-green-50 text-green-600"
                          : "bg-gray-100 text-gray-400"
                      }`}>
                        {cat.isActive ? "Activa" : "Inactiva"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => { setEditId(cat.id); setEditName(cat.name); }}
                        className="text-xs text-gray-500 hover:text-cerise-600 transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleToggle(cat.id, cat.isActive)}
                        disabled={isPending}
                        className={`text-xs font-medium transition-colors ${
                          cat.isActive
                            ? "text-red-400 hover:text-red-600"
                            : "text-green-500 hover:text-green-700"
                        }`}
                      >
                        {cat.isActive ? "Desactivar" : "Activar"}
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
