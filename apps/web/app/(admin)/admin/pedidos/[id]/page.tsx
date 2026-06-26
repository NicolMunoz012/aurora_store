export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getOrderAdminAction } from "@/lib/actions/admin.orders.actions";
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
  const result = await getOrderAdminAction(id);
  if (result.error || !result.data) notFound();

  const order = result.data;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-serif text-3xl mb-2 text-gray-900">
        Pedido #{order.id.slice(-8).toUpperCase()}
      </h1>
      <p className="text-gray-400 text-sm mb-8">Detalle y gestión del pedido.</p>

      <div className="mb-6 rounded-xl border border-gray-100 bg-white p-5 shadow-sm text-sm">
        <p><span className="font-medium text-gray-700">Cliente:</span> {order.clientName} — {order.clientPhone}</p>
        {order.clientEmail && <p><span className="font-medium text-gray-700">Email:</span> {order.clientEmail}</p>}
        <p className="mt-2"><span className="font-medium text-gray-700">Estado:</span> {order.status}</p>
        {order.trackingNumber && <p><span className="font-medium text-gray-700">Rastreo:</span> {order.trackingNumber}</p>}
      </div>

      <div className="mb-6 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-gray-800">Productos</h2>
        <ul className="divide-y divide-gray-50">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between py-2 text-sm">
              <span className="text-gray-700">{item.productName} × {item.quantity}</span>
              <span className="text-gray-600">{formatCOP(item.unitPriceAtPurchase)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between border-t border-gray-100 pt-3 text-sm font-semibold">
          <span>Total</span>
          <span>{formatCOP(order.productsTotal)}</span>
        </div>
      </div>

      <AdminOrderStatusForm orderId={order.id} currentStatus={order.status} />
    </div>
  );
}
