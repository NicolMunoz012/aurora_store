"use client";
// =============================================================================
// components/client/SavedAddressList.tsx (Req 15.4, 15.5)
// =============================================================================

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { SavedAddressRecord, CreateAddressData } from "@aurora/shared";
import { addSavedAddressAction, removeSavedAddressAction } from "@/lib/actions/user.actions";

export function SavedAddressList({ addresses }: { addresses: SavedAddressRecord[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<CreateAddressData>({
    addressName: "",
    department: "",
    municipality: "",
    address: "",
    neighborhood: "",
  });
  const [error, setError] = useState<string | null>(null);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await addSavedAddressAction(form);
      if (result.error) {
        setError(result.error.message);
      } else {
        setShowAdd(false);
        setForm({ addressName: "", department: "", municipality: "", address: "", neighborhood: "" });
        router.refresh();
      }
    });
  }

  function handleRemove(addressId: string) {
    startTransition(async () => {
      await removeSavedAddressAction(addressId);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {addresses.length === 0 && !showAdd && (
        <p className="text-sm text-zinc-400">No tienes direcciones guardadas.</p>
      )}

      {addresses.map((addr) => (
        <div
          key={addr.id}
          className="flex items-start justify-between rounded-lg border border-zinc-200 p-4 dark:border-zinc-700"
        >
          <div>
            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{addr.addressName}</p>
            <p className="text-xs text-zinc-500">
              {[addr.address, addr.neighborhood, addr.municipality, addr.department].filter(Boolean).join(", ")}
            </p>
          </div>
          <button
            onClick={() => handleRemove(addr.id)}
            disabled={isPending}
            aria-label="Eliminar dirección"
            className="text-xs text-red-500 hover:underline disabled:opacity-40"
          >
            Eliminar
          </button>
        </div>
      ))}

      {showAdd ? (
        <form onSubmit={handleAdd} className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
          {[
            { id: "addressName", label: "Nombre (ej. Casa, Oficina)", key: "addressName" as const },
            { id: "dept2", label: "Departamento", key: "department" as const },
            { id: "muni2", label: "Municipio", key: "municipality" as const },
            { id: "addr2", label: "Dirección", key: "address" as const },
            { id: "barrio2", label: "Barrio (opcional)", key: "neighborhood" as const },
          ].map(({ id, label, key }) => (
            <div key={id}>
              <label htmlFor={id} className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                {label}
              </label>
              <input
                id={id}
                type="text"
                value={form[key] ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
              />
            </div>
          ))}
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold text-white disabled:opacity-60 dark:bg-white dark:text-zinc-900"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="text-xs text-zinc-400 underline"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          className="self-start text-sm font-medium text-zinc-700 underline dark:text-zinc-300"
        >
          + Agregar dirección
        </button>
      )}
    </div>
  );
}
