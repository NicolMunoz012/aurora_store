// =============================================================================
// components/shop/HomePage.tsx — Landing page visual component
// Receives data as props. No fetching, no server logic.
// =============================================================================

import Link from "next/link";
import Image from "next/image";
import type { SerializedProductListItem } from "@/lib/serializers";
import type { CategoryRecord } from "@aurora/shared";
import { ProductCard } from "@/components/catalog/ProductCard";

interface HomePageProps {
  featuredProducts: SerializedProductListItem[];
  categories: CategoryRecord[];
}

export function HomePage({ featuredProducts, categories }: HomePageProps) {
  return (
    <div>
      {/* Hero */}
      <section className="bg-blush relative overflow-hidden">
        <div className="container-aurora grid lg:grid-cols-2 items-center gap-10 py-10 md:py-14 lg:py-13">
          <div className="animate-fade-up">
            <span className="text-cerise-600 text-[11px] font-semibold tracking-luxe mb-5 block">
              Tu ritual de belleza
            </span>
            <h1 className="text-[44px] leading-[1.05] md:text-6xl lg:text-7xl text-balance">
              Luminosa{" "}
              <span className="italic text-cerise-600">desde adentro.</span>
            </h1>
            <p className="text-gray-500 text-base md:text-lg mt-6 max-w-md leading-relaxed">
              Productos de belleza seleccionados para potenciar tu brillo natural.
              Precios justos, siempre.
            </p>
            <div className="flex flex-wrap gap-3 mt-9">
              <Link
                href="/catalog"
                className="inline-flex items-center justify-center px-8 py-3.5 bg-cerise-600 text-white text-[12px] tracking-luxe font-semibold rounded-sm hover:bg-cerise-700 transition-colors"
              >
                Ver catálogo
              </Link>
              <Link
                href="/registro"
                className="inline-flex items-center justify-center px-8 py-3.5 border border-gray-200 bg-white text-gray-800 text-[12px] tracking-luxe font-semibold rounded-sm hover:border-cerise-300 hover:text-cerise-600 transition-colors"
              >
                Crear cuenta
              </Link>
            </div>
          </div>
          <div className="relative hidden lg:block">
            {featuredProducts[0]?.mainImageUrl ? (
              <Image
                src={featuredProducts[0].mainImageUrl}
                alt="Producto destacado"
                width={600}
                height={750}
                className="w-full aspect-[4/5] object-cover rounded-md shadow-[0_30px_80px_-30px_rgba(205,14,94,0.3)]"
              />
            ) : (
              <div className="w-full aspect-[4/5] rounded-md bg-cerise-50 flex items-center justify-center">
                <span className="text-cerise-200 text-6xl">✿</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured products */}
      {featuredProducts.length > 0 && (
        <section className="py-20 md:py-28">
          <div className="container-aurora">
            <div className="flex items-end justify-between gap-4 mb-10">
              <div>
                <span className="text-cerise-600 text-[11px] font-semibold tracking-luxe mb-3 block">
                  Lo más buscado
                </span>
                <h2 className="text-3xl md:text-4xl leading-tight">
                  Productos destacados
                </h2>
              </div>
              <Link
                href="/catalog"
                className="text-cerise-600 text-[12px] tracking-luxe font-semibold border-b border-cerise-200 pb-1 hover:border-cerise-600 transition-colors"
              >
                Ver todos
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-10">
              {featuredProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Shop by category */}
      {categories.length > 0 && (
        <section className="py-20 md:py-28 bg-blush-soft">
          <div className="container-aurora">
            <div className="mb-10">
              <span className="text-cerise-600 text-[11px] font-semibold tracking-luxe mb-3 block">
                Explora por categoría
              </span>
              <h2 className="text-3xl md:text-4xl leading-tight">
                Encuentra tu ritual.
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/catalog?categoryIds=${cat.id}`}
                  className="group block rounded-xl bg-white border border-gray-100 p-6 text-center transition-all hover:shadow-md hover:border-cerise-200 hover:-translate-y-0.5"
                >
                  <div className="size-12 mx-auto mb-3 rounded-full bg-blush flex items-center justify-center text-cerise-500 text-lg">
                    ✿
                  </div>
                  <h3 className="font-serif text-base">{cat.name}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA / Newsletter */}
      <section className="py-24 md:py-32 bg-cerise-600 text-white">
        <div className="container-aurora text-center max-w-2xl mx-auto">
          <span className="text-white/60 text-[11px] font-semibold tracking-luxe mb-6 block">
            Aurora Belleza
          </span>
          <h2 className="text-3xl md:text-4xl leading-snug text-balance italic">
            "La belleza es la forma en que te haces sentir a ti misma."
          </h2>
          <p className="text-white/70 mt-6">
            Crea tu cuenta para guardar tu carrito, acceder a precios mayoristas
            y hacer seguimiento de tus pedidos.
          </p>
          <Link
            href="/registro"
            className="mt-8 inline-flex items-center justify-center px-8 py-3.5 bg-white text-cerise-600 text-[12px] tracking-luxe font-semibold rounded-sm hover:bg-white/90 transition-colors"
          >
            Crear mi cuenta
          </Link>
        </div>
      </section>
    </div>
  );
}

function RibbonItem({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 justify-center text-gray-600">
      <span>{icon}</span>
      <span>{children}</span>
    </div>
  );
}
