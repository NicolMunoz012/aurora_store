"use client";
// =============================================================================
// components/admin/CategoryManagementPanel.tsx (Req 17.1–17.4)
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
    startTransition(async () => {
      const result = await createCategoryAction({ name: newName });
      if (result.error) { setError(result.error.message); return; }
      setNewName("");
      router.refresh();
    });
  }

  function handleUpdate(categoryId: string) {
    startTransition(async () => {
      const result = await updateCategoryAction(categoryId, { name: editName });
      if (result.error) { setError(result.error.message); return; }
      setEditId(null);
      router.refresh();
    });
  }

  function handleToggle(categoryId: string, isActive: boolean, confirmed = false) {
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
      {/* Create */}
      <form onSubmit={handleCreate} className="flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nueva categoría..."
          required
          className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-white dark:text-zinc-900"
        >
          Crear
        </button>
      </form>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Warning confirmation */}
      {warning && (
        <div className="rounded-lg bg-amber-50 px-4 py-3 dark:bg-amber-900/20">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            Esta categoría tiene {warning.count} producto{warning.count !== 1 ? "s" : ""} activo{warning.count !== 1 ? "s" : ""}.
            ¿Confirmar desactivación?
          </p>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => handleToggle(warning.categoryId, true, true)}
              disabled={isPending}
              className="rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-600"
            >
              Confirmar
            </button>
            <button onClick={() => setWarning(null)} className="text-xs text-zinc-400 underline">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Category list */}
      <ul className="divide-y divide-zinc-200 dark:divide-zinc-700">
        {categories.map((cat) => (
          <li key={cat.id} className="flex items-center justify-between py-3">
            {editId === cat.id ? (
              <div className="flex flex-1 gap-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1 rounded-lg border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                />
                <button onClick={() => handleUpdate(cat.id)} disabled={isPending} className="text-xs text-green-600 underline">Guardar</button>
                <button onClick={() => setEditId(null)} className="text-xs text-zinc-400 underline">Cancelar</button>
              </div>
            ) : (
              <>
                <div>
                  <span className="text-sm font-medium text-zinc-800 dark:text-zinc-100">{cat.name}</span>
                  <span className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${cat.isActive ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"}`}>
                    {cat.isActive ? "Activa" : "Inactiva"}
                  </span>
                </div>
                <div className="flex gap-3 text-xs">
                  <button onClick={() => { setEditId(cat.id); setEditName(cat.name); }} className="text-zinc-500 underline hover:text-zinc-800">Editar</button>
                  <button
                    onClick={() => handleToggle(cat.id, cat.isActive)}
                    disabled={isPending}
                    className={`underline ${cat.isActive ? "text-red-500" : "text-green-600"}`}
                  >
                    {cat.isActive ? "Desactivar" : "Activar"}
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
