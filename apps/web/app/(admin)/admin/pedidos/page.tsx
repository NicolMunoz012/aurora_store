export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { listOrdersAdminAction } from "@/lib/actions/admin.orders.actions";
import type { OrderStatus } from "@aurora/shared";

export const metadata = { title: "Pedidos — Admin" };

const STATUS_LABELS: Record<string, string> = {
  PENDING_CONFIRMATION: "Por confirmar",
  PENDING: "Pendiente",
  IN_PREPARATION: "En preparación",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
  AUTO_CANCELLED: "Cancelado auto.",
};

function formatCOP(value: string): string {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(parseFloat(value));
}

interface AdminPedidosPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminPedidosPage({ searchParams }: AdminPedidosPageProps) {
  const params = await searchParams;
  const statusFilter = params.status as OrderStatus | undefined;

  const result = await listOrdersAdminAction(
    statusFilter ? { status: statusFilter } : {},
  );
  const orders = result.data ?? [];

  return (
    <div>
      <h1 className="font-serif text-3xl mb-2 text-gray-900">Pedidos</h1>
      <p className="text-gray-400 text-sm mb-8">Gestión y seguimiento de pedidos.</p>

      {/* Status filter */}
      <div className="mb-4 flex flex-wrap gap-2">
        <Link href="/admin/pedidos" className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${!statusFilter ? "bg-cerise-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
          Todos
        </Link>
        {Object.entries(STATUS_LABELS).map(([status, label]) => (
          <Link
            key={status}
            href={`/admin/pedidos?status=${status}`}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${statusFilter === status ? "bg-cerise-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            {label}
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-white p-12 text-center shadow-sm">
          <p className="text-gray-500">No hay pedidos registrados.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50/80">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Cliente</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Estado</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Total</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Fecha</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">#{order.id.slice(-8).toUpperCase()}</td>
                  <td className="px-4 py-3 text-gray-800">{order.clientName}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${order.status === "CANCELLED" || order.status === "AUTO_CANCELLED" ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-600"}`}>
                      {STATUS_LABELS[order.status] ?? order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">{formatCOP(order.productsTotal)}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString("es-CO")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/pedidos/${order.id}`} className="text-xs font-medium text-cerise-600 hover:text-cerise-700">
                      Ver
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
