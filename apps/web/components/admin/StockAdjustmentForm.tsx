"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { adjustStockAction } from "@/lib/actions/admin.inventory.actions";

export function StockAdjustmentForm({ productId, currentStock }: { productId: string; currentStock: number }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [newStock, setNewStock] = useState(currentStock);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await adjustStockAction(productId, newStock, note || undefined);
      if (result.error) { setError(result.error.message); return; }
      setSaved(true);
      setNote("");
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min={0}
        value={newStock}
        onChange={(e) => { setNewStock(Number(e.target.value)); setSaved(false); }}
        className="w-20 rounded-lg border border-gray-200 px-2 py-1 text-sm focus:border-cerise-300 focus:outline-none focus:ring-1 focus:ring-cerise-100"
      />
      <input
        type="text"
        placeholder="Nota"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="w-32 rounded-lg border border-gray-200 px-2 py-1 text-xs focus:border-cerise-300 focus:outline-none focus:ring-1 focus:ring-cerise-100"
      />
      <button
        onClick={handleSave}
        disabled={isPending || newStock === currentStock}
        className="rounded-full bg-cerise-500 px-3 py-1 text-xs font-semibold text-white hover:bg-cerise-600 disabled:opacity-50"
      >
        {isPending ? "..." : "Guardar"}
      </button>
      {saved && <span className="text-xs text-green-600">✓</span>}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
