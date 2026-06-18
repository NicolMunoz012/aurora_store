export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// =============================================================================
// app/(admin)/admin/configuracion/page.tsx — Store config (Req 20.1–20.3)
// =============================================================================

import { getStoreConfigAdminAction } from "@/lib/actions/admin.store-config.actions";
import { StoreConfigForm } from "@/components/admin/StoreConfigForm";

export const metadata = { title: "Configuración — Admin" };

export default async function AdminConfiguracionPage() {
  const result = await getStoreConfigAdminAction();
  const config = result.data;

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-xl font-bold text-zinc-900 dark:text-white">Configuración de tienda</h1>
      {config ? (
        <StoreConfigForm initialConfig={config} />
      ) : (
        <p className="text-sm text-red-500">No se pudo cargar la configuración.</p>
      )}
    </div>
  );
}
