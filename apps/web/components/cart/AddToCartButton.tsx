"use client";
// =============================================================================
// components/cart/AddToCartButton.tsx (Req 5.7, 8.1)
// Client Component. Resolves cart then adds item on click.
// =============================================================================

import { useState, useTransition } from "react";
import { getOrCreateCartAction, addItemToCartAction } from "@/lib/actions/cart.actions";

interface AddToCartButtonProps {
  productId: string;
  productName: string;
  stock: number;
  sessionId: string;
  userId: string | null;
}

export function AddToCartButton({
  productId,
  stock,
  sessionId,
}: AddToCartButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const outOfStock = stock === 0;

  function handleClick() {
    setError(null);
    startTransition(async () => {
      // 1. Get or create cart
      const cartResult = await getOrCreateCartAction(sessionId);
      if (cartResult.error) {
        setError("No se pudo acceder al carrito.");
        return;
      }

      // 2. Add item
      const addResult = await addItemToCartAction({
        cartId: cartResult.data.id,
        productId,
        quantity: 1,
      });

      if (addResult.error) {
        setError(
          addResult.error.code === "INSUFFICIENT_STOCK"
            ? "Stock insuficiente."
            : "No se pudo agregar al carrito.",
        );
        return;
      }

      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    });
  }

  if (outOfStock) {
    return (
      <button
        disabled
        aria-disabled="true"
        className="w-full cursor-not-allowed rounded-full bg-zinc-200 py-3 text-sm font-semibold text-zinc-400 dark:bg-zinc-700 dark:text-zinc-500"
      >
        Agotado
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={handleClick}
        disabled={isPending}
        aria-disabled={isPending}
        className="w-full rounded-full bg-zinc-900 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-60 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {isPending ? "Agregando..." : added ? "¡Agregado! ✓" : "Agregar al carrito"}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
