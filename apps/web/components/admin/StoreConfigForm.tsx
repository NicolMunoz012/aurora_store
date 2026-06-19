"use client";
// =============================================================================
// components/admin/StoreConfigForm.tsx (Req 20.1–20.3)
// =============================================================================

import { useState, useTransition } from "react";
import type { SerializedStoreConfig } from "@/lib/actions/admin.store-config.actions";
import { updateStoreConfigAction } from "@/lib/actions/admin.store-config.actions";

export function StoreConfigForm({ initialConfig }: { initialConfig: SerializedStoreConfig }) {
  const [isPending, startTransition] = useTransition();
  const [threshold, setThreshold] = useState(initialConfig.wholesaleThreshold);
  const [whatsapp, setWhatsapp] = useState(initialConfig.whatsappNumber);
  const [address, setAddress] = useState(initialConfig.storePhysicalAddress);
  const [anonDays, setAnonDays] = useState(initialConfig.anonOrderExpiryDays);
  const [regDays, setRegDays] = useState(initialConfig.registeredOrderExpiryDays);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validate wholesaleThreshold (Req 20.2)
    const parsed = parseFloat(threshold);
    if (isNaN(parsed) || parsed <= 0) {
      setError("El umbral mayorista debe ser un número positivo.");
      return;
    }

    startTransition(async () => {
      const result = await updateStoreConfigAction({
        wholesaleThreshold: threshold,
        whatsappNumber: whatsapp,
        storePhysicalAddress: address,
        anonOrderExpiryDays: anonDays,
        registeredOrderExpiryDays: regDays,
      });
      if (result.error) { setError(result.error.message); return; }
      setSuccess(true);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="threshold" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Umbral precio mayorista (COP)
        </label>
        <input
          id="threshold"
          type="number"
          min={1}
          value={threshold}
          onChange={(e) => setThreshold(e.target.value)}
          required
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
        />
      </div>
      <div>
        <label htmlFor="whatsapp" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Número WhatsApp (con código de país, sin +)
        </label>
        <input
          id="whatsapp"
          type="text"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
        />
      </div>
      <div>
        <label htmlFor="storeAddr" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Dirección física de la tienda
        </label>
        <input
          id="storeAddr"
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="anonDays" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Expiración pedidos anónimos (días)
          </label>
          <input
            id="anonDays"
            type="number"
            min={1}
            value={anonDays}
            onChange={(e) => setAnonDays(Number(e.target.value))}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
          />
        </div>
        <div>
          <label htmlFor="regDays" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Expiración pedidos registrados (días)
          </label>
          <input
            id="regDays"
            type="number"
            min={1}
            value={regDays}
            onChange={(e) => setRegDays(Number(e.target.value))}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
          />
        </div>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {success && <p className="text-sm text-green-600">Configuración guardada correctamente.</p>}
      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-white dark:text-zinc-900"
      >
        {isPending ? "Guardando..." : "Guardar configuración"}
      </button>
    </form>
  );
}
