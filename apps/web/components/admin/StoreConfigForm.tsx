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
  const [instagram, setInstagram] = useState(initialConfig.instagramUrl ?? "");
  const [facebook, setFacebook] = useState(initialConfig.facebookUrl ?? "");
  const [tiktok, setTiktok] = useState(initialConfig.tiktokUrl ?? "");
  const [announcement, setAnnouncement] = useState(initialConfig.announcementText ?? "");
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
        instagramUrl: instagram.trim() || null,
        facebookUrl: facebook.trim() || null,
        tiktokUrl: tiktok.trim() || null,
        announcementText: announcement.trim() || null,
      });
      if (result.error) { setError(result.error.message); return; }
      setSuccess(true);
    });
  }

  const inputClass = "w-full px-4 py-3 bg-white border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-cerise-400 transition-colors";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Tienda */}
      <section>
        <h3 className="font-serif text-xl text-gray-900 mb-4">Tienda</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="threshold" className="text-[11px] tracking-luxe font-medium text-gray-500 mb-1.5 block">Umbral precio mayorista (COP)</label>
            <input id="threshold" type="number" min={1} value={threshold} onChange={(e) => setThreshold(e.target.value)} required className={inputClass} />
          </div>
          <div>
            <label htmlFor="whatsapp" className="text-[11px] tracking-luxe font-medium text-gray-500 mb-1.5 block">WhatsApp (con código de país, sin +)</label>
            <input id="whatsapp" type="text" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className={inputClass} placeholder="573001234567" />
          </div>
          <div>
            <label htmlFor="storeAddr" className="text-[11px] tracking-luxe font-medium text-gray-500 mb-1.5 block">Dirección física</label>
            <input id="storeAddr" type="text" value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="anonDays" className="text-[11px] tracking-luxe font-medium text-gray-500 mb-1.5 block">Expiración anónimos (días)</label>
              <input id="anonDays" type="number" min={1} value={anonDays} onChange={(e) => setAnonDays(Number(e.target.value))} className={inputClass} />
            </div>
            <div>
              <label htmlFor="regDays" className="text-[11px] tracking-luxe font-medium text-gray-500 mb-1.5 block">Expiración registrados (días)</label>
              <input id="regDays" type="number" min={1} value={regDays} onChange={(e) => setRegDays(Number(e.target.value))} className={inputClass} />
            </div>
          </div>
        </div>
      </section>

      {/* Anuncio */}
      <section>
        <h3 className="font-serif text-xl text-gray-900 mb-4">Banner de anuncio</h3>
        <div>
          <label htmlFor="announcement" className="text-[11px] tracking-luxe font-medium text-gray-500 mb-1.5 block">Texto del banner (aparece en la parte superior de la tienda)</label>
          <input id="announcement" type="text" value={announcement} onChange={(e) => setAnnouncement(e.target.value)} className={inputClass} placeholder="Ej: Envío gratis a partir de $100.000 · Envíos a todo Colombia" />
        </div>
      </section>

      {/* Redes sociales */}
      <section>
        <h3 className="font-serif text-xl text-gray-900 mb-4">Redes sociales</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="instagram" className="text-[11px] tracking-luxe font-medium text-gray-500 mb-1.5 block">Instagram (URL completa)</label>
            <input id="instagram" type="url" value={instagram} onChange={(e) => setInstagram(e.target.value)} className={inputClass} placeholder="https://instagram.com/aurora_belleza" />
          </div>
          <div>
            <label htmlFor="facebook" className="text-[11px] tracking-luxe font-medium text-gray-500 mb-1.5 block">Facebook (URL completa)</label>
            <input id="facebook" type="url" value={facebook} onChange={(e) => setFacebook(e.target.value)} className={inputClass} placeholder="https://facebook.com/aurorabelleza" />
          </div>
          <div>
            <label htmlFor="tiktok" className="text-[11px] tracking-luxe font-medium text-gray-500 mb-1.5 block">TikTok (URL completa)</label>
            <input id="tiktok" type="url" value={tiktok} onChange={(e) => setTiktok(e.target.value)} className={inputClass} placeholder="https://tiktok.com/@aurora_belleza" />
          </div>
        </div>
      </section>

      {error && <div className="bg-cerise-50 border border-cerise-100 rounded-sm px-4 py-2.5"><p className="text-sm text-cerise-700">{error}</p></div>}
      {success && <div className="bg-emerald-50 border border-emerald-100 rounded-sm px-4 py-2.5"><p className="text-sm text-emerald-700">✓ Configuración guardada.</p></div>}

      <button type="submit" disabled={isPending} className="bg-cerise-600 text-white px-6 py-3 text-[12px] tracking-luxe font-semibold rounded-sm hover:bg-cerise-700 transition-colors disabled:opacity-60">
        {isPending ? "Guardando..." : "Guardar configuración"}
      </button>
    </form>
  );
}
