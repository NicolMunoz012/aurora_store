export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// =============================================================================
// app/(admin)/admin/inventario/page.tsx — Inventory management (Req 19.2, 19.3)
// =============================================================================

import { getLowStockProductsAction } from "@/lib/actions/admin.inventory.actions";
import { listProductsAction } from "@/lib/actions/catalog.actions";
import { StockAdjustmentForm } from "@/components/admin/StockAdjustmentForm";

export const metadata = { title: "Inventario — Admin" };

export default async function AdminInventarioPage() {
  const [productsResult, lowStockResult] = await Promise.all([
    listProductsAction({}),
    getLowStockProductsAction(),
  ]);

  const products = productsResult.data ?? [];
  const lowStockIds = new Set((lowStockResult.data ?? []).map((p) => p.id));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-xl font-bold text-zinc-900 dark:text-white">Inventario</h1>

      {lowStockResult.data && lowStockResult.data.length > 0 && (
        <div className="mb-6 rounded-lg bg-amber-50 px-4 py-3 dark:bg-amber-900/20">
          <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
            ⚠ {lowStockResult.data.length} producto{lowStockResult.data.length !== 1 ? "s" : ""} con stock bajo
          </p>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-800">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-zinc-600">Producto</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-600">Stock actual</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-600">Ajustar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700 bg-white dark:bg-zinc-900">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-4 py-3 text-zinc-800 dark:text-zinc-100">
                  {product.name}
                  {lowStockIds.has(product.id) && (
                    <span className="ml-2 rounded-full bg-amber-100 px-1.5 py-0.5 text-xs text-amber-700">Stock bajo</span>
                  )}
                </td>
                <td className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">{product.stock}</td>
                <td className="px-4 py-3">
                  <StockAdjustmentForm productId={product.id} currentStock={product.stock} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
