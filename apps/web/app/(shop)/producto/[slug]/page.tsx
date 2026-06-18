export const runtime = "nodejs";

// =============================================================================
// app/(shop)/producto/[slug]/page.tsx — Product detail page (Req 5.5–5.9, 9.1, 9.2)
// Server Component. Calls notFound() when product doesn't exist.
// =============================================================================

import { notFound } from "next/navigation";
import { getProductBySlugAction, getStoreConfigAction } from "@/lib/actions/catalog.actions";
import { ProductImageGallery } from "@/components/catalog/ProductImageGallery";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";

export const revalidate = 60;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const result = await getProductBySlugAction(slug);
  if (!result.data) return { title: "Producto no encontrado — Aurora Belleza" };
  return {
    title: `${result.data.name} — Aurora Belleza`,
    description: result.data.description ?? undefined,
  };
}

function formatCOP(value: string): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(parseFloat(value));
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const [productResult, configResult] = await Promise.all([
    getProductBySlugAction(slug),
    getStoreConfigAction(),
  ]);

  if (!productResult.data) notFound();

  const product = productResult.data;
  const config = configResult.data;
  const outOfStock = product.stock === 0;

  // Get cart context for AddToCartButton
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("aurora_session_id")?.value ?? "";
  const session = await auth();

  // We need the cart ID — get or create cart first
  // (cart is created lazily; cartId resolved client-side via AddToCartButton)

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Image gallery */}
        <ProductImageGallery
          images={product.images}
          productName={product.name}
        />

        {/* Product info */}
        <div className="flex flex-col gap-4">
          <div className="text-sm font-medium uppercase tracking-wider text-zinc-400">
            {product.category.name}
          </div>

          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            {product.name}
          </h1>

          {product.description && (
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {product.description}
            </p>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-zinc-900 dark:text-white">
              {formatCOP(product.retailPrice)}
            </span>
            <span className="text-xs text-zinc-400">IVA incluido</span>
          </div>

          {/* Wholesale legend (Req 9.1) */}
          {product.minWholesaleQty != null && config && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
              Precio mayorista disponible al comprar{" "}
              <strong>{product.minWholesaleQty}</strong> unidades o más, cuando
              tu carrito supere{" "}
              <strong>
                {formatCOP(config.wholesaleThreshold.toString())} COP
              </strong>
              .
            </p>
          )}

          {/* Stock */}
          {outOfStock ? (
            <p className="text-sm font-semibold text-red-500">Agotado</p>
          ) : (
            <p className="text-sm text-zinc-500">
              {product.stock} unidade{product.stock !== 1 ? "s" : ""} disponible{product.stock !== 1 ? "s" : ""}
            </p>
          )}

          {/* Add to cart */}
          <AddToCartButton
            productId={product.id}
            productName={product.name}
            stock={product.stock}
            sessionId={sessionId}
            userId={session?.user?.id ?? null}
          />
        </div>
      </div>
    </div>
  );
}
