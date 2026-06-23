export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { getStoreConfigAdminAction } from "@/lib/actions/admin.store-config.actions";
import { StoreConfigForm } from "@/components/admin/StoreConfigForm";

export const metadata = { title: "Configuración — Admin" };

export default async function AdminConfiguracionPage() {
  const result = await getStoreConfigAdminAction();
  const config = result.data;

  return (
    <div className="max-w-4xl">
      <h1 className="font-serif text-3xl mb-2 text-gray-900">Configuración</h1>
      <p className="text-gray-400 text-sm mb-8">Administra los datos de tu tienda, redes sociales y banner de anuncios.</p>
      {config ? (
        <div className="bg-white border border-gray-100 rounded-md p-8">
          <StoreConfigForm initialConfig={config} />
        </div>
      ) : (
        <p className="text-sm text-red-500">No se pudo cargar la configuración.</p>
      )}
    </div>
  );
}
