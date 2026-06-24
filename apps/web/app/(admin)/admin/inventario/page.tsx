export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100 bg-gray-50/80">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Producto</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Stock actual</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Ajustar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50/50">
                <td className="px-4 py-3 text-gray-800">
                  {product.name}
                  {lowStockIds.has(product.id) && (
                    <span className="ml-2 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600">Stock bajo</span>
                  )}
                </td>
                <td className="px-4 py-3 font-semibold text-gray-700">{product.stock}</td>
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
