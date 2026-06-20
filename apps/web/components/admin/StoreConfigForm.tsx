"use client";

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

  const inputClass = "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-sm transition-all focus:border-cerise-300 focus:outline-none focus:ring-2 focus:ring-cerise-100";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label htmlFor="threshold" className="mb-1.5 block text-sm font-medium text-gray-700">
          Umbral precio mayorista (COP)
        </label>
        <input id="threshold" type="number" min={1} value={threshold} onChange={(e) => setThreshold(e.target.value)} required className={inputClass} />
      </div>
      <div>
        <label htmlFor="whatsapp" className="mb-1.5 block text-sm font-medium text-gray-700">
          Número WhatsApp (con código de país, sin +)
        </label>
        <input id="whatsapp" type="text" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label htmlFor="storeAddr" className="mb-1.5 block text-sm font-medium text-gray-700">
          Dirección física de la tienda
        </label>
        <input id="storeAddr" type="text" value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="anonDays" className="mb-1.5 block text-sm font-medium text-gray-700">Expiración anónimos (días)</label>
          <input id="anonDays" type="number" min={1} value={anonDays} onChange={(e) => setAnonDays(Number(e.target.value))} className={inputClass} />
        </div>
        <div>
          <label htmlFor="regDays" className="mb-1.5 block text-sm font-medium text-gray-700">Expiración registrados (días)</label>
          <input id="regDays" type="number" min={1} value={regDays} onChange={(e) => setRegDays(Number(e.target.value))} className={inputClass} />
        </div>
      </div>
      {error && <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3"><p className="text-sm text-red-600">{error}</p></div>}
      {success && <div className="rounded-xl border border-green-100 bg-green-50 px-4 py-3"><p className="text-sm text-green-600">✓ Configuración guardada.</p></div>}
      <button type="submit" disabled={isPending} className="self-start rounded-full bg-cerise-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-cerise-600 hover:shadow-md disabled:opacity-60">
        {isPending ? "Guardando..." : "Guardar configuración"}
      </button>
    </form>
  );
}
