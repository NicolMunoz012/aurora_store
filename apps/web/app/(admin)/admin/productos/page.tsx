export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// =============================================================================
// app/(admin)/admin/productos/page.tsx — Product list (Req 16.1, 19.2)
// =============================================================================

import Link from "next/link";
import { listProductsAction } from "@/lib/actions/catalog.actions";
import { getLowStockProductsAction } from "@/lib/actions/admin.inventory.actions";

export const metadata = { title: "Productos — Admin" };

function formatCOP(value: string): string {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(parseFloat(value));
}

export default async function AdminProductosPage() {
  // listProductsAction with isActive:true by default — for admin we need all
  // We call without filter to get all active; admin use case would ideally include inactive.
  // For now we use the public action and note inactive products.
  const [productsResult, lowStockResult] = await Promise.all([
    listProductsAction({}),
    getLowStockProductsAction(),
  ]);

  const products = productsResult.data ?? [];
  const lowStockIds = new Set((lowStockResult.data ?? []).map((p) => p.id));

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Productos</h1>
        <Link
          href="/admin/productos/nuevo"
          className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900"
        >
          + Nuevo producto
        </Link>
      </div>
      <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-800">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Nombre</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Precio</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Stock</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700 bg-white dark:bg-zinc-900">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-4 py-3 font-medium text-zinc-800 dark:text-zinc-100">
                  {product.name}
                  {lowStockIds.has(product.id) && (
                    <span className="ml-2 rounded-full bg-amber-100 px-1.5 py-0.5 text-xs text-amber-700">
                      Stock bajo
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{formatCOP(product.retailPrice)}</td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{product.stock}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${product.isActive ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"}`}>
                    {product.isActive ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/productos/${product.id}`} className="text-xs text-zinc-500 underline hover:text-zinc-800">
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
