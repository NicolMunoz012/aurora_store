export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// =============================================================================
// app/(admin)/admin/pedidos/[id]/page.tsx — Order detail admin (Req 18.3–18.6)
// =============================================================================

import { notFound } from "next/navigation";
import { getOrderAction } from "@/lib/actions/orders.actions";
import { AdminOrderStatusForm } from "@/components/admin/AdminOrderStatusForm";

export const metadata = { title: "Detalle pedido — Admin" };

function formatCOP(value: string): string {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(parseFloat(value));
}

interface AdminOrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
  const { id } = await params;
  // Admin can see any order (no userId ownership check)
  const result = await getOrderAction(id);
  if (result.error || !result.data) notFound();

  const order = result.data;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-xl font-bold text-zinc-900 dark:text-white">
        Pedido #{order.id.slice(-8).toUpperCase()}
      </h1>

      <div className="mb-6 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900 text-sm">
        <p><span className="font-medium">Cliente:</span> {order.clientName} — {order.clientPhone}</p>
        {order.clientEmail && <p><span className="font-medium">Email:</span> {order.clientEmail}</p>}
        <p className="mt-2"><span className="font-medium">Estado:</span> {order.status}</p>
        {order.trackingNumber && <p><span className="font-medium">Rastreo:</span> {order.trackingNumber}</p>}
      </div>

      <div className="mb-6 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <h2 className="mb-3 text-sm font-semibold">Productos</h2>
        <ul className="divide-y divide-zinc-100 dark:divide-zinc-700">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between py-2 text-sm">
              <span className="text-zinc-700 dark:text-zinc-300">{item.productName} × {item.quantity}</span>
              <span>{formatCOP(item.unitPriceAtPurchase)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex justify-between border-t border-zinc-100 pt-2 dark:border-zinc-700 text-sm font-semibold">
          <span>Total</span>
          <span>{formatCOP(order.productsTotal)}</span>
        </div>
      </div>

      <AdminOrderStatusForm orderId={order.id} currentStatus={order.status} />
    </div>
  );
}
