"use client";
// =============================================================================
// components/client/SavedAddressList.tsx — Saved addresses (editorial style)
// =============================================================================

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { SavedAddressRecord, CreateAddressData } from "@aurora/shared";
import { addSavedAddressAction, removeSavedAddressAction } from "@/lib/actions/user.actions";
import { MapPin } from "lucide-react";

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

  const inputClass = "w-full px-4 py-2.5 bg-white border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-cerise-400 transition-colors";
  const labelClass = "text-[11px] tracking-luxe font-medium text-gray-500 mb-1.5 block";

  return (
    <div className="flex flex-col gap-4">
      {addresses.length === 0 && !showAdd && (
        <p className="text-sm text-gray-400">No tienes direcciones guardadas aún.</p>
      )}

      {addresses.map((addr) => (
        <div key={addr.id} className="flex items-start justify-between rounded-sm border border-gray-100 bg-blush-soft p-4">
          <div className="flex items-start gap-3">
            <MapPin className="size-4 text-cerise-400 mt-0.5 shrink-0" strokeWidth={1.5} />
            <div>
              <p className="text-sm font-medium text-gray-800">{addr.addressName}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {[addr.address, addr.neighborhood, addr.municipality, addr.department].filter(Boolean).join(", ")}
              </p>
            </div>
          </div>
          <button
            onClick={() => handleRemove(addr.id)}
            disabled={isPending}
            className="text-xs text-red-400 hover:text-red-600 transition-colors ml-4 shrink-0"
          >
            Eliminar
          </button>
        </div>
      ))}

      {showAdd ? (
        <form onSubmit={handleAdd} className="flex flex-col gap-4 rounded-sm border border-gray-100 bg-gray-50/50 p-5 mt-2">
          <h3 className="text-[11px] tracking-luxe font-semibold text-gray-500">Nueva dirección</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {([
              { id: "addressName", label: "Nombre (ej. Casa, Oficina)", key: "addressName" as const },
              { id: "dept", label: "Departamento", key: "department" as const },
              { id: "muni", label: "Municipio", key: "municipality" as const },
              { id: "addr", label: "Dirección", key: "address" as const },
              { id: "barrio", label: "Barrio (opcional)", key: "neighborhood" as const },
            ] as const).map(({ id, label, key }) => (
              <div key={id} className={key === "addressName" || key === "address" ? "sm:col-span-2" : ""}>
                <label htmlFor={id} className={labelClass}>{label}</label>
                <input
                  id={id}
                  type="text"
                  value={form[key] ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className={inputClass}
                />
              </div>
            ))}
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="bg-cerise-600 text-white px-5 py-2 text-[12px] tracking-luxe font-semibold rounded-sm hover:bg-cerise-700 transition-colors disabled:opacity-60"
            >
              {isPending ? "Guardando..." : "Guardar dirección"}
            </button>
            <button type="button" onClick={() => setShowAdd(false)} className="text-xs text-gray-400 hover:text-gray-600">
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          className="self-start text-[12px] tracking-luxe font-semibold text-cerise-600 hover:text-cerise-700 transition-colors mt-2"
        >
          + Agregar dirección
        </button>
      )}
    </div>
  );
}
