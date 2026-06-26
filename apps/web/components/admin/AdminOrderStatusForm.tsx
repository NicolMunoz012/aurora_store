"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { OrderStatus } from "@aurora/shared";
import { updateOrderStatusAction, cancelOrderAction, deleteOrderAction } from "@/lib/actions/admin.orders.actions";

const NEXT_STATUSES: Partial<Record<string, OrderStatus[]>> = {
  PENDING_CONFIRMATION: ["PENDING", "CANCELLED"],
  PENDING: ["IN_PREPARATION", "CANCELLED"],
  IN_PREPARATION: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
};

export function AdminOrderStatusForm({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "">("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nextOptions = NEXT_STATUSES[currentStatus] ?? [];
  const isFinal = nextOptions.length === 0;

  function handleUpdate() {
    if (!selectedStatus) return;
    setError(null);
    startTransition(async () => {
      const result = await updateOrderStatusAction(orderId, selectedStatus, selectedStatus === "SHIPPED" ? trackingNumber : undefined);
      if (result.error) { setError(result.error.message); return; }
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

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteOrderAction(orderId);
      if (result.error) { setError(result.error.message); return; }
      router.push("/admin/pedidos");
    });
  }

  const inputClass = "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-sm transition-all focus:border-cerise-300 focus:outline-none focus:ring-2 focus:ring-cerise-100";

  return (
    <div className="space-y-4">
      {/* Status change section */}
      {!isFinal ? (
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-gray-800">Cambiar estado</h2>

          <div className="flex flex-col gap-3">
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)} className={inputClass}>
              <option value="">Seleccionar nuevo estado…</option>
              {nextOptions.filter((s) => s !== "CANCELLED").map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {selectedStatus === "SHIPPED" && (
              <input type="text" placeholder="Número de rastreo" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} className={inputClass} />
            )}

            {error && <div className="rounded-lg bg-red-50 px-3 py-2"><p className="text-sm text-red-600">{error}</p></div>}

            <div className="flex gap-2">
              <button onClick={handleUpdate} disabled={!selectedStatus || isPending} className="rounded-full bg-cerise-500 px-4 py-2 text-sm font-semibold text-white hover:bg-cerise-600 disabled:opacity-60">
                {isPending ? "Actualizando..." : "Actualizar estado"}
              </button>

              {nextOptions.includes("CANCELLED") && !confirmCancel && (
                <button onClick={() => setConfirmCancel(true)} disabled={isPending} className="rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60">
                  Cancelar pedido
                </button>
              )}
            </div>

            {confirmCancel && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                <p className="mb-2 text-sm text-red-700">
                  ¿Confirmar cancelación? Si el stock ya fue descontado, será revertido.
                </p>
                <div className="flex gap-2">
                  <button onClick={handleCancel} disabled={isPending} className="rounded-full bg-red-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-red-600">
                    Confirmar
                  </button>
                  <button onClick={() => setConfirmCancel(false)} className="text-xs text-gray-500 hover:text-gray-700">
                    No cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-400">Este pedido está en estado final ({currentStatus}).</p>
      )}

      {/* Delete section — always visible for admins */}
      <div className="rounded-xl border border-red-100 bg-white p-5 shadow-sm">
        <h2 className="mb-1 text-sm font-semibold text-red-700">Zona peligrosa</h2>
        <p className="mb-3 text-xs text-gray-500">Eliminar el pedido de forma permanente. Esta acción no se puede deshacer.</p>

        {error && !confirmDelete && <div className="mb-3 rounded-lg bg-red-50 px-3 py-2"><p className="text-sm text-red-600">{error}</p></div>}

        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            disabled={isPending}
            className="rounded-full border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
          >
            🗑 Eliminar pedido
          </button>
        ) : (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="mb-2 text-sm font-semibold text-red-700">
              ⚠️ ¿Eliminar este pedido permanentemente?
            </p>
            <p className="mb-3 text-xs text-red-600">
              Se eliminarán también todos los ítems del pedido. No hay forma de recuperarlo.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="rounded-full bg-red-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {isPending ? "Eliminando..." : "Sí, eliminar"}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                disabled={isPending}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
