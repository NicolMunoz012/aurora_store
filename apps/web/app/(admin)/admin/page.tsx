export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// =============================================================================
// app/(admin)/admin/page.tsx — Admin dashboard
// =============================================================================

import Link from "next/link";
import { getLowStockProductsAction } from "@/lib/actions/admin.inventory.actions";
import { listOrdersAdminAction } from "@/lib/actions/admin.orders.actions";

export const metadata = { title: "Dashboard — Admin" };

export default async function AdminDashboardPage() {
  const [lowStockResult, recentOrdersResult] = await Promise.all([
    getLowStockProductsAction(),
    listOrdersAdminAction({}),
  ]);

  const lowStockCount = lowStockResult.data?.length ?? 0;
  const orders = recentOrdersResult.data ?? [];
  const pendingOrders = orders.filter((o) => o.status === "PENDING_CONFIRMATION" || o.status === "PENDING");
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Metric cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Pedidos totales</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{orders.length}</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Pendientes</p>
          <p className={`mt-2 text-3xl font-bold ${pendingOrders.length > 0 ? "text-cerise-600" : "text-gray-900"}`}>
            {pendingOrders.length}
          </p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Stock bajo</p>
          <p className={`mt-2 text-3xl font-bold ${lowStockCount > 0 ? "text-amber-500" : "text-green-500"}`}>
            {lowStockCount}
          </p>
          {lowStockCount > 0 && (
            <Link href="/admin/inventario" className="mt-1 block text-xs text-gray-400 hover:text-cerise-600">
              Ver inventario →
            </Link>
          )}
        </div>
      </div>

      {/* Recent orders */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-50 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-800">Pedidos recientes</h2>
          <Link href="/admin/pedidos" className="text-xs font-medium text-cerise-600 hover:text-cerise-700">
            Ver todos →
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-gray-400">Sin pedidos aún.</p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {recentOrders.map((order) => (
              <li key={order.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <span className="font-mono text-xs text-gray-500">
                    #{order.id.slice(-8).toUpperCase()}
                  </span>
                  <span className="ml-3 text-sm text-gray-700">{order.clientName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                    {order.status}
                  </span>
                  <Link
                    href={`/admin/pedidos/${order.id}`}
                    className="text-xs text-cerise-600 hover:text-cerise-700"
                  >
                    Ver
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
