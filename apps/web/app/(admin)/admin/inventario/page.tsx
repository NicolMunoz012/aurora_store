export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { getLowStockProductsAction } from "@/lib/actions/admin.inventory.actions";
import { listProductsAction } from "@/lib/actions/catalog.actions";
import { listActiveProductBrandsAction } from "@/lib/actions/admin.product-brands.actions";
import { StockAdjustmentForm } from "@/components/admin/StockAdjustmentForm";
import Link from "next/link";

export const metadata = { title: "Inventario — Admin" };

interface Props {
  searchParams: Promise<{ brandId?: string }>;
}

export default async function AdminInventarioPage({ searchParams }: Props) {
  const { brandId } = await searchParams;

  const [productsResult, lowStockResult, brandsResult] = await Promise.all([
    listProductsAction({ brandId: brandId || undefined }),
    getLowStockProductsAction(),
    listActiveProductBrandsAction(),
  ]);

  const products = productsResult.data ?? [];
  const lowStockIds = new Set((lowStockResult.data ?? []).map((p) => p.id));
  const brands = brandsResult.data ?? [];

  return (
    <div>
      <h1 className="font-serif text-3xl mb-2 text-gray-900">Inventario</h1>
      <p className="text-gray-400 text-sm mb-8">Niveles de stock en tiempo real.</p>

      {lowStockResult.data && lowStockResult.data.length > 0 && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm font-semibold text-amber-700">
            ⚠ {lowStockResult.data.length} producto{lowStockResult.data.length !== 1 ? "s" : ""} con stock bajo
          </p>
        </div>
      )}

      {/* ── Filtros ────────────────────────────────────────────────── */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <span className="text-sm text-gray-500 font-medium">Filtrar por marca:</span>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/inventario"
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              !brandId
                ? "bg-cerise-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Todas
          </Link>
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/admin/inventario?brandId=${brand.id}`}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                brandId === brand.id
                  ? "bg-cerise-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {brand.name}
            </Link>
          ))}
        </div>
        {brandId && brands.find((b) => b.id === brandId) && (
          <span className="text-xs text-gray-400">
            Mostrando {products.length} producto{products.length !== 1 ? "s" : ""} de{" "}
            <strong>{brands.find((b) => b.id === brandId)?.name}</strong>
          </span>
        )}
      </div>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-x-auto">
        <table className="w-full min-w-[480px] text-sm">
          <thead className="border-b border-gray-100 bg-gray-50/80">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Producto</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Marca</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Stock actual</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Ajustar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-sm text-gray-400">
                  {brandId ? "No hay productos para esta marca." : "No hay productos."}
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 text-gray-800">
                    {product.name}
                    {lowStockIds.has(product.id) && (
                      <span className="ml-2 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600">Stock bajo</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {product.brand?.name ?? <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-700">{product.stock}</td>
                  <td className="px-4 py-3">
                    <StockAdjustmentForm productId={product.id} currentStock={product.stock} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
