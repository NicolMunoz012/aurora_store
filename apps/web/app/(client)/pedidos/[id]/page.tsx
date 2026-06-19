export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// =============================================================================
// app/(client)/pedidos/[id]/page.tsx — Order detail (Req 14.3–14.6)
// Server Component. Layout guarantees session exists.
// =============================================================================

import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrderAction, generateWhatsappMessageAction } from "@/lib/actions/orders.actions";
import { WhatsappButton } from "@/components/client/WhatsappButton";

export const metadata = { title: "Detalle de pedido — Aurora Belleza" };

const STATUS_STEPS = [
  "PENDING_CONFIRMATION",
  "PENDING",
  "IN_PREPARATION",
  "SHIPPED",
  "DELIVERED",
] as const;

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

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const result = await getOrderAction(id);

  if (result.error || !result.data) notFound();

  const order = result.data;
  const currentStepIndex = STATUS_STEPS.indexOf(order.status as (typeof STATUS_STEPS)[number]);
  const isCancelled = order.status === "CANCELLED" || order.status === "AUTO_CANCELLED";

  // Fetch WhatsApp URL server-side for PENDING_CONFIRMATION orders
  let whatsappUrl: string | null = null;
  if (order.status === "PENDING_CONFIRMATION") {
    const waResult = await generateWhatsappMessageAction(order.id);
    whatsappUrl = waResult.data?.whatsappUrl ?? null;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="mb-2 text-sm text-zinc-400">
        <Link href="/pedidos" className="hover:underline">
          Mis pedidos
        </Link>{" "}
        / #{order.id.slice(-8).toUpperCase()}
      </div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-white">
        Pedido #{order.id.slice(-8).toUpperCase()}
      </h1>

      {/* Status progression timeline (Req 14.3) */}
      {!isCancelled ? (
        <ol className="mb-8 flex items-start gap-0">
          {STATUS_STEPS.map((step, i) => {
            const done = i < currentStepIndex;
            const active = i === currentStepIndex;
            return (
              <li key={step} className="flex flex-1 flex-col items-center text-center">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                    done
                      ? "bg-green-500 text-white"
                      : active
                      ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                      : "bg-zinc-200 text-zinc-400 dark:bg-zinc-700"
                  }`}
                >
                  {done ? "✓" : i + 1}
                </div>
                <span className={`mt-1 text-[10px] leading-tight ${active ? "font-semibold text-zinc-800 dark:text-zinc-100" : "text-zinc-400"}`}>
                  {STATUS_LABELS[step]}
                </span>
                {i < STATUS_STEPS.length - 1 && (
                  <div className={`absolute top-3.5 h-0.5 w-full ${done ? "bg-green-500" : "bg-zinc-200 dark:bg-zinc-700"}`} />
                )}
              </li>
            );
          })}
        </ol>
      ) : (
        <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 dark:bg-red-900/20">
          <p className="text-sm font-semibold text-red-700 dark:text-red-300">
            {STATUS_LABELS[order.status]}
          </p>
        </div>
      )}

      {/* Tracking number (Req 14.4) */}
      {order.status === "SHIPPED" && order.trackingNumber && (
        <div className="mb-6 rounded-lg bg-blue-50 px-4 py-3 dark:bg-blue-900/20">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Número de rastreo:{" "}
            <span className="font-mono font-semibold">{order.trackingNumber}</span>
          </p>
        </div>
      )}

      {/* Send via WhatsApp button (Req 14.5) */}
      {order.status === "PENDING_CONFIRMATION" && whatsappUrl && (
        <div className="mb-6">
          <WhatsappButton whatsappUrl={whatsappUrl} />
        </div>
      )}

      {/* Order items */}
      <div className="mb-6 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <h2 className="mb-3 text-sm font-semibold text-zinc-800 dark:text-zinc-100">
          Productos
        </h2>
        <ul className="divide-y divide-zinc-100 dark:divide-zinc-700">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between py-2 text-sm">
              <span className="text-zinc-700 dark:text-zinc-300">
                {item.productName} × {item.quantity}
              </span>
              <span className="font-medium text-zinc-900 dark:text-white">
                {formatCOP(item.unitPriceAtPurchase)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between border-t border-zinc-100 pt-3 dark:border-zinc-700">
          <span className="text-sm font-semibold">Total</span>
          <span className="text-sm font-bold">{formatCOP(order.productsTotal)}</span>
        </div>
        <p className="mt-1 text-right text-xs text-zinc-400">IVA incluido</p>
      </div>

      {/* WhatsApp returns link (Req 14.6) */}
      <div className="rounded-lg border border-zinc-200 p-4 text-sm text-zinc-500 dark:border-zinc-700">
        ¿Necesitas devolución o cambio?{" "}
        <a
          href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ""}?text=${encodeURIComponent(`Hola, quiero gestionar una devolución del pedido #${order.id.slice(-8).toUpperCase()}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-zinc-800 underline dark:text-zinc-200"
        >
          Contáctanos por WhatsApp
        </a>
      </div>
    </div>
  );
}
