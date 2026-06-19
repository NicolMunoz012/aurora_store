"use client";
// =============================================================================
// components/cart/CartItemControls.tsx (Req 8.2, 8.3)
// +/- quantity controls and remove button for cart items.
// =============================================================================

import { useTransition } from "react";
import { updateCartItemAction, removeCartItemAction } from "@/lib/actions/cart.actions";
import { useRouter } from "next/navigation";

interface CartItemControlsProps {
  cartItemId: string;
  cartId: string;
  quantity: number;
  stock: number;
}

export function CartItemControls({
  cartItemId,
  cartId,
  quantity,
  stock,
}: CartItemControlsProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function update(newQty: number) {
    startTransition(async () => {
      await updateCartItemAction({ cartItemId, cartId, quantity: newQty });
      router.refresh();
    });
  }

  function remove() {
    startTransition(async () => {
      await removeCartItemAction({ cartItemId, cartId });
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => update(quantity - 1)}
        disabled={isPending}
        aria-label="Reducir cantidad"
        className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-300 text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        −
      </button>

      <span
        className="min-w-[2rem] text-center text-sm font-medium tabular-nums"
        aria-live="polite"
        aria-label={`Cantidad: ${quantity}`}
      >
        {quantity}
      </span>

      <button
        onClick={() => update(quantity + 1)}
        disabled={isPending || quantity >= stock}
        aria-label="Aumentar cantidad"
        className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-300 text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        +
      </button>

      <button
        onClick={remove}
        disabled={isPending}
        aria-label="Eliminar producto del carrito"
        className="ml-2 text-xs text-red-500 hover:underline disabled:opacity-40"
      >
        Eliminar
      </button>
    </div>
  );
}
