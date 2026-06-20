export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { getStoreConfigAdminAction } from "@/lib/actions/admin.store-config.actions";
import { StoreConfigForm } from "@/components/admin/StoreConfigForm";

export const metadata = { title: "Configuración — Admin" };

export default async function AdminConfiguracionPage() {
  const result = await getStoreConfigAdminAction();
  const config = result.data;

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Configuración de tienda</h1>
      {config ? (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <StoreConfigForm initialConfig={config} />
        </div>
      ) : (
        <p className="text-sm text-red-500">No se pudo cargar la configuración.</p>
      )}
    </div>
  );
}
