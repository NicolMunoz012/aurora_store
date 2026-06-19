"use client";
// =============================================================================
// components/admin/AdminOrderStatusForm.tsx (Req 18.3–18.6)
// Status transition form with tracking number input and cancel confirmation.
// =============================================================================

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { OrderStatus } from "@aurora/shared";
import { updateOrderStatusAction, cancelOrderAction } from "@/lib/actions/admin.orders.actions";

const NEXT_STATUSES: Partial<Record<string, OrderStatus[]>> = {
  PENDING_CONFIRMATION: ["PENDING", "CANCELLED"],
  PENDING: ["IN_PREPARATION", "CANCELLED"],
  IN_PREPARATION: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
};

export function AdminOrderStatusForm({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "">("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nextOptions = NEXT_STATUSES[currentStatus] ?? [];
  const isFinal = nextOptions.length === 0;

  function handleUpdate() {
    if (!selectedStatus) return;
    setError(null);
    startTransition(async () => {
      const result = await updateOrderStatusAction(
        orderId,
        selectedStatus,
        selectedStatus === "SHIPPED" ? trackingNumber : undefined,
      );
      if (result.error) {
        setError(result.error.message);
        return;
      }
      router.refresh();
    });
  }

  function handleCancel() {
    startTransition(async () => {
      const result = await cancelOrderAction(orderId);
      if (result.error) { setError(result.error.message); return; }
      setConfirmCancel(false);
      router.refresh();
    });
  }

  if (isFinal) {
    return <p className="text-sm text-zinc-400">Este pedido está en estado final ({currentStatus}).</p>;
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
      <h2 className="mb-4 text-sm font-semibold text-zinc-800 dark:text-zinc-100">Cambiar estado</h2>

      <div className="flex flex-col gap-3">
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
        >
          <option value="">Seleccionar nuevo estado…</option>
          {nextOptions.filter((s) => s !== "CANCELLED").map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {selectedStatus === "SHIPPED" && (
          <input
            type="text"
            placeholder="Número de rastreo"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
          />
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-2">
          <button
            onClick={handleUpdate}
            disabled={!selectedStatus || isPending}
            className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-white dark:text-zinc-900"
          >
            {isPending ? "Actualizando..." : "Actualizar estado"}
          </button>

          {/* Cancel with confirmation dialog (Req 18.5) */}
          {nextOptions.includes("CANCELLED") && !confirmCancel && (
            <button
              onClick={() => setConfirmCancel(true)}
              disabled={isPending}
              className="rounded-full border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
            >
              Cancelar pedido
            </button>
          )}
        </div>

        {confirmCancel && (
          <div className="rounded-lg bg-red-50 px-3 py-3 dark:bg-red-900/20">
            <p className="mb-2 text-sm text-red-700 dark:text-red-300">
              ¿Confirmar cancelación del pedido? Esta acción revertirá el stock.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                disabled={isPending}
                className="rounded-full bg-red-500 px-4 py-2 text-xs font-semibold text-white hover:bg-red-600"
              >
                Confirmar cancelación
              </button>
              <button onClick={() => setConfirmCancel(false)} className="text-xs text-zinc-400 underline">
                No cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
