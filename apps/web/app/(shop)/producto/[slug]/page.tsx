export const runtime = "nodejs";

// =============================================================================
// app/(shop)/producto/[slug]/page.tsx — Product detail page (editorial style)
// =============================================================================

import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductBySlugAction, getStoreConfigAction } from "@/lib/actions/catalog.actions";
import { ProductImageGallery } from "@/components/catalog/ProductImageGallery";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { getDiscountedPrice, getSavings, formatCOP } from "@/lib/discount";

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

  const cookieStore = await cookies();
  const sessionId = cookieStore.get("aurora_session_id")?.value ?? "";
  const session = await auth();

  const originalPrice = parseFloat(product.retailPrice);
  const finalPrice = product.discountPercentage
    ? getDiscountedPrice(originalPrice, product.discountPercentage)
    : originalPrice;
  const savings = product.discountPercentage
    ? getSavings(originalPrice, product.discountPercentage)
    : 0;

  return (
    <div className="container-aurora py-10 md:py-16">
      {/* Breadcrumb */}
      <nav className="mb-8 text-[11px] tracking-luxe text-gray-400 flex items-center gap-2">
        <Link href="/catalog" className="hover:text-cerise-600 transition-colors">Catálogo</Link>
        <span>/</span>
        {product.category && (
          <>
            <Link href={`/catalog?categoryIds=${product.category.id}`} className="hover:text-cerise-600 transition-colors">
              {product.category.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-gray-600">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Image gallery */}
        <ProductImageGallery images={product.images} productName={product.name} />

        {/* Product info */}
        <div className="flex flex-col gap-6 lg:pt-2">
          {/* Meta */}
          <div className="flex items-center gap-3">
            {product.category && (
              <span className="text-[11px] tracking-luxe text-gray-400 uppercase">
                {product.category.name}
              </span>
            )}
            {product.brand && (
              <>
                {product.category && <span className="text-gray-300">·</span>}
                <span className="text-[11px] tracking-luxe text-gray-400 uppercase">
                  {product.brand.name}
                </span>
              </>
            )}
          </div>

          {/* Name */}
          <h1 className="font-serif text-3xl md:text-4xl text-gray-900 leading-tight">
            {product.name}
          </h1>

          {/* Price block */}
          <div className="flex items-end gap-3">
            <span className="font-serif text-3xl text-cerise-600">{formatCOP(finalPrice)}</span>
            {product.discountPercentage && (
              <>
                <span className="text-xl text-gray-300 line-through mb-0.5">{formatCOP(originalPrice)}</span>
                <span className="text-[11px] tracking-luxe font-semibold text-cerise-600 bg-cerise-50 px-2 py-1 rounded-sm mb-0.5">
                  -{product.discountPercentage}%
                </span>
              </>
            )}
          </div>
          {savings > 0 && (
            <p className="text-sm text-cerise-600 -mt-4">
              Ahorras {formatCOP(savings)}
            </p>
          )}

          {/* Description */}
          {product.description && (
            <p className="text-gray-500 text-[15px] leading-relaxed border-t border-gray-100 pt-6">
              {product.description}
            </p>
          )}

          {/* Wholesale info */}
          {product.minWholesaleQty != null && config && (
            <div className="rounded-sm bg-blush border border-cerise-100 px-4 py-3 text-sm text-cerise-700">
              Precio mayorista disponible al comprar <strong>{product.minWholesaleQty}</strong> unidades
              o más, cuando tu carrito supere{" "}
              <strong>{formatCOP(config.wholesaleThreshold.toString())}</strong>.
            </div>
          )}

          {/* Out of stock */}
          {outOfStock && (
            <p className="text-sm font-semibold text-gray-400 tracking-luxe uppercase">
              Agotado temporalmente
            </p>
          )}

          {/* Add to cart */}
          <div className="mt-2">
            <AddToCartButton
              productId={product.id}
              productName={product.name}
              stock={product.stock}
              sessionId={sessionId}
              userId={session?.user?.id ?? null}
            />
          </div>

          {/* Trust indicators */}
          <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-6 text-[11px] tracking-luxe text-gray-400">
            <div className="flex items-center gap-2">
              <span className="text-cerise-400">✦</span>
              Envíos a todo Colombia
            </div>
            <div className="flex items-center gap-2">
              <span className="text-cerise-400">✦</span>
              Atención por WhatsApp
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
