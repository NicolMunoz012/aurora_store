export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const metadata = { title: "Marcas — Admin" };

// =============================================================================
// app/(admin)/admin/marcas/page.tsx
// Sección 1: Logos de marcas (vitrina/homepage) — BrandsPanel existente.
// Sección 2: Marcas de productos — ProductBrandsCrudPanel (CRUD con FK real).
// =============================================================================

import { listBrandsAction } from "@/lib/actions/admin.brands.actions";
import { listProductBrandsAction, getProductBrandCountsAction } from "@/lib/actions/admin.product-brands.actions";
import { BrandsPanel } from "@/components/admin/BrandsPanel";
import { ProductBrandsCrudPanel } from "@/components/admin/ProductBrandsCrudPanel";

export default async function AdminMarcasPage() {
  const [logoResult, productBrandsResult, countsResult] = await Promise.all([
    listBrandsAction(),
    listProductBrandsAction(),
    getProductBrandCountsAction(),
  ]);

  const logosBrands = logoResult.data ?? [];
  const productBrands = productBrandsResult.data ?? [];
  const productCounts = countsResult.data ?? {};

  return (
    <div className="max-w-4xl flex flex-col gap-14">
      {/* ── Sección 1: Logos de vitrina ─────────────────────────────────── */}
      <section>
        <h1 className="font-serif text-3xl mb-2 text-gray-900">Marcas que vendemos</h1>
        <p className="text-gray-400 text-sm mb-8">
          Sube hasta 5 logos de marcas. Se mostrarán en la página principal.
        </p>
        <BrandsPanel initialBrands={logosBrands} />
      </section>

      {/* ── Sección 2: Marcas de productos ──────────────────────────────── */}
      <section>
        <h2 className="font-serif text-2xl mb-2 text-gray-900">Marcas de productos</h2>
        <p className="text-gray-400 text-sm mb-8">
          Administra las marcas que puedes asignar a cada producto del catálogo.
          Las marcas inactivas no aparecen en el formulario de creación de productos.
        </p>
        <ProductBrandsCrudPanel
          brands={productBrands}
          productCounts={productCounts}
        />
      </section>
    </div>
  );
}
