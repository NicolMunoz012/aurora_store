export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// =============================================================================
// app/(shop)/carrito/page.tsx — Cart page (editorial style)
// =============================================================================

import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { getCartWithPricingAction } from "@/lib/actions/cart.actions";
import { CartItemControls } from "@/components/cart/CartItemControls";
import Link from "next/link";

export const metadata = { title: "Tu carrito — Aurora Belleza" };

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
  const itemCount = cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

  return (
    <main className="container-aurora py-14 min-h-[60vh]">
      <h1 className="font-serif text-4xl md:text-5xl mb-2">Tu carrito</h1>
      <p className="text-gray-400 mb-12">
        {itemCount} {itemCount === 1 ? "producto" : "productos"}
      </p>

      {isEmpty ? (
        <div className="border border-dashed border-gray-200 rounded-md py-24 text-center">
          <div className="size-14 mx-auto rounded-full bg-blush grid place-items-center text-cerise-500 mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-6">
              <path fillRule="evenodd" d="M6 5v1H4.667a1.75 1.75 0 0 0-1.743 1.598l-.826 9.5A1.75 1.75 0 0 0 3.84 19H16.16a1.75 1.75 0 0 0 1.743-1.902l-.826-9.5A1.75 1.75 0 0 0 15.333 6H14V5a4 4 0 0 0-8 0Zm4-2.5A2.5 2.5 0 0 0 7.5 5v1h5V5A2.5 2.5 0 0 0 10 2.5ZM7.5 10a2.5 2.5 0 0 0 5 0V8.75a.75.75 0 0 1 1.5 0V10a4 4 0 0 1-8 0V8.75a.75.75 0 0 1 1.5 0V10Z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="font-serif text-2xl mb-2">Tu carrito está vacío.</p>
          <p className="text-gray-400 text-sm mb-6">
            Descubre nuestra colección de productos de belleza.
          </p>
          <Link
            href="/catalog"
            className="inline-flex px-7 py-3 bg-cerise-600 text-white text-[12px] tracking-luxe font-semibold rounded-sm hover:bg-cerise-700 transition-colors"
          >
            Ver catálogo
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_380px] gap-12">
          {/* Items */}
          <div className="divide-y divide-gray-100 border-y border-gray-100">
            {cart.items.map((item) => (
              <div key={item.cartItemId} className="py-6 grid grid-cols-[80px_1fr_auto] gap-5 items-center">
                {item.mainImageUrl ? (
                  <img
                    src={item.mainImageUrl}
                    alt={item.productName}
                    className="w-20 h-20 object-cover rounded-md bg-gray-50"
                  />
                ) : (
                  <div className="w-20 h-20 bg-blush rounded-md grid place-items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-8 text-cerise-500">
                      <path fillRule="evenodd" d="M6 5v1H4.667a1.75 1.75 0 0 0-1.743 1.598l-.826 9.5A1.75 1.75 0 0 0 3.84 19H16.16a1.75 1.75 0 0 0 1.743-1.902l-.826-9.5A1.75 1.75 0 0 0 15.333 10H14V5a4 4 0 0 0-8 0Zm4-2.5A2.5 2.5 0 0 0 7.5 5v1h5V5A2.5 2.5 0 0 0 10 2.5ZM7.5 10a2.5 2.5 0 0 0 5 0V8.75a.75.75 0 0 1 1.5 0V10a4 4 0 0 1-8 0V8.75a.75.75 0 0 1 1.5 0V10Z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-serif text-lg leading-tight text-gray-900">
                    {item.productName}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    {formatCOP(item.unitPrice)} × {item.quantity}
                  </p>
                  <div className="mt-3">
                    <CartItemControls
                      cartItemId={item.cartItemId}
                      cartId={cart.cartId}
                      quantity={item.quantity}
                      stock={item.stock}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-medium text-gray-900">
                    {formatCOP(item.lineTotal)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <aside className="bg-blush-soft rounded-md p-7 h-fit lg:sticky lg:top-28">
            <h2 className="font-serif text-2xl mb-5">Resumen del pedido</h2>

            {/* Wholesale notification */}
            {cart.wholesaleApplied && (
              <div className="mb-4 rounded-sm bg-green-50 border border-green-100 px-4 py-2.5 text-sm text-green-700">
                ✓ Precio mayorista aplicado
              </div>
            )}

            {!cart.wholesaleApplied && cart.amountToThreshold && (
              <div className="mb-4 rounded-sm bg-cerise-50 border border-cerise-100 px-4 py-2.5 text-sm text-cerise-700">
                Te faltan <strong>{formatCOP(cart.amountToThreshold)}</strong> para precio mayorista.
              </div>
            )}

            <div className="flex justify-between py-1.5 text-sm text-gray-600">
              <span>Subtotal</span>
              <span>{formatCOP(cart.finalSubtotal)}</span>
            </div>
            <div className="flex justify-between py-1.5 text-sm text-gray-600">
              <span>Envío</span>
              <span className="text-gray-400">Se informa por WhatsApp</span>
            </div>
            <div className="border-t border-gray-200 my-4" />
            <div className="flex justify-between text-base font-semibold text-gray-900">
              <span>Total productos</span>
              <span>{formatCOP(cart.finalSubtotal)}</span>
            </div>
            

            <Link
              href="/checkout"
              className="block text-center mt-6 bg-cerise-600 text-white py-3.5 text-[12px] tracking-luxe font-semibold rounded-sm hover:bg-cerise-700 transition-colors"
            >
              Finalizar compra
            </Link>

            {!session && (
              <p className="text-[11px] text-gray-400 text-center mt-4">
                <Link href="/registro" className="text-cerise-600 hover:underline">Regístrate</Link>{" "}
                para guardar tu carrito y hacer seguimiento.
              </p>
            )}
          </aside>
        </div>
      )}
    </main>
  );
}
