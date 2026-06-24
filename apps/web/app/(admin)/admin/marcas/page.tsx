export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const metadata = { title: "Marcas — Admin" };

import { listBrandsAction } from "@/lib/actions/admin.brands.actions";
import { BrandsPanel } from "@/components/admin/BrandsPanel";

export default async function AdminMarcasPage() {
  const result = await listBrandsAction();
  const brands = result.data ?? [];

  return (
    <div className="max-w-4xl">
      <h1 className="font-serif text-3xl mb-2 text-gray-900">Marcas que vendemos</h1>
      <p className="text-gray-400 text-sm mb-8">
        Sube hasta 5 logos de marcas. Se mostrarán en la página principal.
      </p>
      <BrandsPanel initialBrands={brands} />
    </div>
  );
}
