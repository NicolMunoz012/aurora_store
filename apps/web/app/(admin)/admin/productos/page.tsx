export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// =============================================================================
// app/(admin)/admin/productos/page.tsx — Product list (backoffice table view)
// =============================================================================

import Link from "next/link";
import { listProductsAction } from "@/lib/actions/catalog.actions";
import { getLowStockProductsAction } from "@/lib/actions/admin.inventory.actions";

export const metadata = { title: "Productos — Admin" };

function formatCOP(value: string): string {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(parseFloat(value));
}

export default async function AdminProductosPage() {
  const [productsResult, lowStockResult] = await Promise.all([
    listProductsAction({}),
    getLowStockProductsAction(),
  ]);

  const products = productsResult.data ?? [];
  const lowStockIds = new Set((lowStockResult.data ?? []).map((p) => p.id));

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-serif text-3xl text-gray-900">Productos</h1>
          <p className="text-gray-400 text-sm mt-1">Gestiona tu catálogo de productos.</p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="rounded-lg bg-cerise-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-cerise-600 hover:shadow-md"
        >
          + Nuevo producto
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-white p-12 text-center shadow-sm">
          <p className="text-gray-500">No hay productos registrados.</p>
          <Link href="/admin/productos/nuevo" className="mt-2 inline-block text-sm font-medium text-cerise-600 hover:text-cerise-700">
            Crea tu primer producto →
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50/80">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Producto</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Categoría</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Precio</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Stock</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">Estado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((product) => (
                <tr key={product.id} className="transition-colors hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-800">{product.name}</span>
                    {lowStockIds.has(product.id) && (
                      <span className="ml-2 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600">
                        ⚠ Stock bajo
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{product.category?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{formatCOP(product.retailPrice)}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-700">{product.stock}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      product.isActive ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"
                    }`}>
                      {product.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/productos/${product.id}`}
                      className="rounded-md px-2.5 py-1 text-xs font-medium text-cerise-600 transition-colors hover:bg-cerise-50"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
