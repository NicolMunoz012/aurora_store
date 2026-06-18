export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// =============================================================================
// app/(admin)/admin/page.tsx — Admin dashboard (Req 19.1)
// =============================================================================

import Link from "next/link";
import { getLowStockProductsAction } from "@/lib/actions/admin.inventory.actions";
import { listOrdersAdminAction } from "@/lib/actions/admin.orders.actions";

export const metadata = { title: "Panel de administración — Aurora Belleza" };

export default async function AdminDashboardPage() {
  const [lowStockResult, recentOrdersResult] = await Promise.all([
    getLowStockProductsAction(),
    listOrdersAdminAction({}),
  ]);

  const lowStockCount = lowStockResult.data?.length ?? 0;
  const recentOrders = (recentOrdersResult.data ?? []).slice(0, 10);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 text-2xl font-bold text-zinc-900 dark:text-white">
        Panel de administración
      </h1>

      {/* Quick nav */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { href: "/admin/productos", label: "Productos" },
          { href: "/admin/categorias", label: "Categorías" },
          { href: "/admin/pedidos", label: "Pedidos" },
          { href: "/admin/inventario", label: "Inventario" },
          { href: "/admin/configuracion", label: "Configuración" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-xl border border-zinc-200 bg-white p-4 text-center text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {item.label}
          </Link>
        ))}
      </div>

      {/* Widgets */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Low stock widget */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
          <h2 className="mb-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400">
            Productos con stock bajo
          </h2>
          <p className={`text-3xl font-bold ${lowStockCount > 0 ? "text-amber-500" : "text-green-500"}`}>
            {lowStockCount}
          </p>
          <Link href="/admin/inventario" className="mt-2 block text-xs text-zinc-400 underline">
            Ver inventario
          </Link>
        </div>

        {/* Recent orders widget */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
          <h2 className="mb-4 text-sm font-semibold text-zinc-600 dark:text-zinc-400">
            Pedidos recientes
          </h2>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-zinc-400">Sin pedidos aún.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {recentOrders.map((order) => (
                <li key={order.id}>
                  <Link
                    href={`/admin/pedidos/${order.id}`}
                    className="flex justify-between text-xs hover:opacity-80"
                  >
                    <span className="text-zinc-700 dark:text-zinc-300">
                      #{order.id.slice(-8).toUpperCase()} — {order.clientName}
                    </span>
                    <span className="text-zinc-400">{order.status}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link href="/admin/pedidos" className="mt-3 block text-xs text-zinc-400 underline">
            Ver todos
          </Link>
        </div>
      </div>
    </div>
  );
}
