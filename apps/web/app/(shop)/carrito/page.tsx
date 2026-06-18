export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// =============================================================================
// app/(shop)/carrito/page.tsx — Cart page (Req 4.2, 8.4–8.7)
// =============================================================================

import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { getCartWithPricingAction } from "@/lib/actions/cart.actions";
import { CartItemControls } from "@/components/cart/CartItemControls";
import Link from "next/link";

export const metadata = { title: "Carrito — Aurora Belleza" };

function formatCOP(value: string): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(parseFloat(value));
}

export default async function CartPage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("aurora_session_id")?.value ?? "";
  const session = await auth();

  const result = await getCartWithPricingAction(sessionId);
  const cart = result.data;

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-white">
        Tu carrito
      </h1>

      {isEmpty ? (
        <div className="py-16 text-center">
          <p className="text-zinc-500 dark:text-zinc-400">Tu carrito está vacío.</p>
          <Link
            href="/catalog"
            className="mt-4 inline-block rounded-full bg-zinc-900 px-6 py-2 text-sm font-semibold text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900"
          >
            Ver catálogo
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Items */}
          <ul className="flex-1 divide-y divide-zinc-200 dark:divide-zinc-700">
            {cart.items.map((item) => (
              <li key={item.productId} className="flex gap-4 py-4">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                    {item.productName}
                  </p>
                  <p className="mt-1 text-xs text-zinc-400">
                    {formatCOP(item.unitPrice)}{" "}
                    <span className="text-zinc-400">× {item.quantity}</span>
                    {" "}={" "}
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                      {formatCOP(item.lineTotal)}
                    </span>
                  </p>
                  <p className="text-[10px] text-zinc-400">IVA incluido</p>
                </div>
                <CartItemControls
                  cartItemId={item.productId}
                  cartId={sessionId}
                  quantity={item.quantity}
                  stock={999} // stock validated at checkout
                />
              </li>
            ))}
          </ul>

          {/* Summary */}
          <aside className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-700 dark:bg-zinc-900 lg:w-72">
            <h2 className="mb-4 text-base font-semibold text-zinc-900 dark:text-white">
              Resumen
            </h2>

            {/* Wholesale applied notification (Req 8.6) */}
            {cart.wholesaleApplied && (
              <div className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-300">
                ✓ Precio mayorista aplicado
              </div>
            )}

            {/* Amount to threshold (Req 8.5) */}
            {!cart.wholesaleApplied && cart.amountToThreshold && (
              <div className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
                Te faltan{" "}
                <strong>{formatCOP(cart.amountToThreshold)} COP</strong>{" "}
                para acceder al precio mayorista.
              </div>
            )}

            <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-400">
              <span>Subtotal</span>
              <span>{formatCOP(cart.finalSubtotal)}</span>
            </div>
            <p className="mt-1 text-xs text-zinc-400">IVA incluido</p>

            <Link
              href="/checkout"
              className="mt-6 block w-full rounded-full bg-zinc-900 py-3 text-center text-sm font-semibold text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900"
            >
              Proceder al checkout
            </Link>

            {/* Progressive registration for guests (Req 4.2) */}
            {!session && (
              <p className="mt-4 text-center text-xs text-zinc-400">
                <Link href="/registro" className="text-zinc-700 underline dark:text-zinc-300">
                  Regístrate
                </Link>{" "}
                para guardar tu carrito y hacer seguimiento de pedidos.
              </p>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
