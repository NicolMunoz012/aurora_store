export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// =============================================================================
// app/(admin)/admin/pedidos/page.tsx — Order management list (Req 18.1, 18.2, 18.7)
// =============================================================================

import Link from "next/link";
import { listOrdersAdminAction } from "@/lib/actions/admin.orders.actions";
import type { OrderStatus } from "@aurora/shared";

export const metadata = { title: "Pedidos — Admin" };

const STATUS_LABELS: Record<string, string> = {
  PENDING_CONFIRMATION: "Pendiente de confirmación",
  PENDING: "Pendiente",
  IN_PREPARATION: "En preparación",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
  AUTO_CANCELLED: "Cancelado automáticamente",
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
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-xl font-bold text-zinc-900 dark:text-white">Pedidos</h1>

      {/* Status filter */}
      <div className="mb-4 flex flex-wrap gap-2">
        <Link href="/admin/pedidos" className={`rounded-full px-3 py-1 text-xs font-medium ${!statusFilter ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"}`}>
          Todos
        </Link>
        {Object.entries(STATUS_LABELS).map(([status, label]) => (
          <Link
            key={status}
            href={`/admin/pedidos?status=${status}`}
            className={`rounded-full px-3 py-1 text-xs font-medium ${statusFilter === status ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-300"}`}
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-800">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">ID</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Cliente</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Estado</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Total</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Fecha</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700 bg-white dark:bg-zinc-900">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-4 py-3 font-mono text-xs text-zinc-500">#{order.id.slice(-8).toUpperCase()}</td>
                <td className="px-4 py-3 text-zinc-800 dark:text-zinc-100">{order.clientName}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${order.status === "AUTO_CANCELLED" ? "bg-red-100 text-red-700" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"}`}>
                    {STATUS_LABELS[order.status] ?? order.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{formatCOP(order.productsTotal)}</td>
                <td className="px-4 py-3 text-xs text-zinc-400">
                  {new Date(order.createdAt).toLocaleDateString("es-CO")}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/pedidos/${order.id}`} className="text-xs text-zinc-500 underline hover:text-zinc-800">
                    Ver
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
