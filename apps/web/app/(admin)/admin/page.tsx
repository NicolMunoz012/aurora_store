export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// =============================================================================
// app/(admin)/admin/page.tsx — Admin dashboard (Lovable editorial style)
// =============================================================================

import Link from "next/link";
import { getLowStockProductsAction } from "@/lib/actions/admin.inventory.actions";
import { listOrdersAdminAction } from "@/lib/actions/admin.orders.actions";
import { listProductsAction } from "@/lib/actions/catalog.actions";

export const metadata = { title: "Dashboard — Admin" };

function formatCOP(value: string): string {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(parseFloat(value));
}

const STATUS_LABELS: Record<string, string> = {
  PENDING_CONFIRMATION: "Por confirmar",
  PENDING: "Pendiente",
  IN_PREPARATION: "En preparación",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
  AUTO_CANCELLED: "Cancelado auto.",
};

export default async function AdminDashboardPage() {
  const [lowStockResult, ordersResult, productsResult] = await Promise.all([
    getLowStockProductsAction(),
    listOrdersAdminAction({}),
    listProductsAction({}),
  ]);

  const lowStockCount = lowStockResult.data?.length ?? 0;
  const orders = ordersResult.data ?? [];
  const products = productsResult.data ?? [];
  const pendingOrders = orders.filter((o) => o.status === "PENDING_CONFIRMATION" || o.status === "PENDING");
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl text-gray-900">
            <Greeting />, Aurora.
          </h1>
          <p className="text-gray-400 text-sm mt-1">Así va la boutique hoy.</p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="bg-cerise-600 text-white px-5 py-2.5 text-[12px] tracking-luxe font-semibold rounded-sm inline-flex items-center gap-2 hover:bg-cerise-700 transition-colors shrink-0"
        >
          + Nuevo producto
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Productos" value={String(products.length)} />
        <StatCard label="Pedidos" value={String(orders.length)} />
        <StatCard label="Pendientes" value={String(pendingOrders.length)} highlight={pendingOrders.length > 0} />
        <StatCard label="Stock bajo" value={String(lowStockCount)} highlight={lowStockCount > 0} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Inventory table */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-md overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl">Inventario</h2>
              <p className="text-xs text-gray-400">Niveles de stock en tiempo real</p>
            </div>
            <Link href="/admin/inventario" className="text-[11px] tracking-luxe text-cerise-600 inline-flex items-center gap-1 font-semibold hover:text-cerise-700">
              Ver todo →
            </Link>
          </div>
          {products.length === 0 ? (
            <p className="px-5 py-8 text-sm text-gray-400 text-center">No hay productos registrados.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-sm">
                <thead className="bg-warm-gray text-[11px] tracking-luxe text-gray-400">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium">Producto</th>
                    <th className="text-left px-5 py-3 font-medium">Stock</th>
                    <th className="text-left px-5 py-3 font-medium">Estado</th>
                    <th className="text-right px-5 py-3 font-medium">Precio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.slice(0, 7).map((p) => {
                    const low = lowStockResult.data?.some((ls) => ls.id === p.id);
                    return (
                      <tr key={p.id} className="hover:bg-warm-gray/50">
                        <td className="px-5 py-3">
                          <div className="min-w-0">
                            <div className="font-medium truncate text-gray-800">{p.name}</div>
                            <div className="text-xs text-gray-400 truncate">{p.category?.name ?? "—"}</div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-gray-500">{p.stock} uds</td>
                        <td className="px-5 py-3">
                          <span className={`text-[10px] tracking-luxe px-2 py-1 rounded-sm font-semibold ${
                            low ? "bg-blush text-cerise-600" : p.isActive ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-400"
                          }`}>
                            {low ? "Stock bajo" : p.isActive ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right font-medium text-gray-700">{formatCOP(p.retailPrice)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent orders */}
        <div className="bg-white border border-gray-100 rounded-md p-5">
          <h2 className="font-serif text-xl mb-1">Pedidos recientes</h2>
          <p className="text-xs text-gray-400 mb-4">Últimos pedidos registrados</p>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">Sin pedidos aún.</p>
          ) : (
            <ul className="divide-y divide-gray-50">
              {recentOrders.map((order) => (
                <li key={order.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate text-gray-800">{order.clientName}</div>
                    <div className="text-xs text-gray-400">#{order.id.slice(-8).toUpperCase()}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-medium text-gray-700">{formatCOP(order.productsTotal)}</div>
                    <div className="text-[10px] tracking-luxe text-gray-400">{STATUS_LABELS[order.status] ?? order.status}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/admin/pedidos"
            className="block mt-4 text-center text-[11px] tracking-luxe text-cerise-600 font-semibold hover:text-cerise-700"
          >
            Ver todos los pedidos →
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="bg-white border border-gray-100 rounded-md p-5">
      <p className="text-[11px] tracking-luxe text-gray-400">{label}</p>
      <p className={`font-serif text-3xl mt-2 ${highlight ? "text-cerise-600" : "text-gray-900"}`}>
        {value}
      </p>
    </div>
  );
}

function Greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return <>Buenos días</>;
  if (hour < 18) return <>Buenas tardes</>;
  return <>Buenas noches</>;
}
