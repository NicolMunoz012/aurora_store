"use client";
// =============================================================================
// components/cart/AddToCartButton.tsx — Add to cart with visual feedback
// =============================================================================

import { useState, useTransition } from "react";
import { getOrCreateCartAction, addItemToCartAction } from "@/lib/actions/cart.actions";
import { Check, ShoppingBag } from "lucide-react";

interface AddToCartButtonProps {
  productId: string;
  productName: string;
  stock: number;
  sessionId: string;
  userId: string | null;
}

export function AddToCartButton({ productId, stock, sessionId }: AddToCartButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const outOfStock = stock === 0;

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const cartResult = await getOrCreateCartAction(sessionId);
      if (cartResult.error) { setError("No se pudo acceder al carrito."); return; }

      const addResult = await addItemToCartAction({
        cartId: cartResult.data.id,
        productId,
        quantity: 1,
      });

      if (addResult.error) {
        setError(addResult.error.code === "INSUFFICIENT_STOCK" ? "Stock insuficiente." : "No se pudo agregar al carrito.");
        return;
      }

      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    });
  }

  if (outOfStock) {
    return (
      <button disabled aria-disabled="true" className="w-full cursor-not-allowed rounded-sm bg-gray-100 py-4 text-[12px] tracking-luxe font-semibold text-gray-400">
        Agotado
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleClick}
        disabled={isPending || added}
        className={`w-full flex items-center justify-center gap-2 rounded-sm py-4 text-[12px] tracking-luxe font-semibold transition-all ${
          added
            ? "bg-green-500 text-white"
            : "bg-cerise-600 text-white hover:bg-cerise-700"
        } disabled:opacity-70`}
      >
        {added ? (
          <><Check className="size-4" /> Añadido al carrito</>
        ) : isPending ? (
          "Añadiendo..."
        ) : (
          <><ShoppingBag className="size-4" /> Añadir al carrito</>
        )}
      </button>
      {error && <p className="text-xs text-red-500 text-center">{error}</p>}
    </div>
  );
}
