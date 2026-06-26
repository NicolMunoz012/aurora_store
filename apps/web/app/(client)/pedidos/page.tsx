export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// =============================================================================
// app/(client)/pedidos/page.tsx — Order history (Req 14.1, 14.2)
// Server Component. Layout guarantees session exists.
// =============================================================================

import Link from "next/link";
import { listOrdersByUserAction } from "@/lib/actions/orders.actions";

export const metadata = { title: "Mis pedidos — LunaRose" };

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
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(parseFloat(value));
}

export default async function PedidosPage() {
  const result = await listOrdersByUserAction();
  const orders = result.data ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-white">
        Mis pedidos
      </h1>

      {orders.length === 0 ? (
        // Empty state with link to catalog (Req 14.2)
        <div className="py-16 text-center">
          <p className="text-zinc-500 dark:text-zinc-400">No tienes pedidos aún.</p>
          <Link
            href="/catalog"
            className="mt-4 inline-block rounded-full bg-zinc-900 px-6 py-2 text-sm font-semibold text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900"
          >
            Ver catálogo
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-700">
          {orders.map((order) => (
            <li key={order.id} className="py-4">
              <Link
                href={`/pedidos/${order.id}`}
                className="flex items-center justify-between hover:opacity-80"
              >
                <div>
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                    Pedido #{order.id.slice(-8).toUpperCase()}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {new Date(order.createdAt).toLocaleDateString("es-CO", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                    {STATUS_LABELS[order.status] ?? order.status}
                  </span>
                  <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-white">
                    {formatCOP(order.productsTotal)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
