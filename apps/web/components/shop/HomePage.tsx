// =============================================================================
// components/shop/HomePage.tsx — Landing page visual component
// Receives data as props. No fetching, no server logic.
// =============================================================================

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import type { SerializedProductListItem } from "@/lib/serializers";
import type { CategoryRecord } from "@aurora/shared";
import type { BrandRecord } from "@/lib/actions/admin.brands.actions";
import { ProductCard } from "@/components/catalog/ProductCard";

interface HomePageProps {
  featuredProducts: SerializedProductListItem[];
  categories: CategoryRecord[];
  brands: BrandRecord[];
  categoryProducts: Record<string, SerializedProductListItem[]>;
}

// ---------------------------------------------------------------------------
// BrandsCarousel — auto-scrolling brand logos strip
// Mobile: always full color. Desktop: grayscale → color on hover.
// Shows carousel when > 2 brands, static row otherwise.
// ---------------------------------------------------------------------------
function BrandsCarousel({ brands }: { brands: BrandRecord[] }) {
  const VISIBLE = 3; // how many fit in view at once (mobile)
  const useCarousel = brands.length > 2;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!useCarousel || paused) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % brands.length);
    }, 2200);
    return () => clearInterval(id);
  }, [useCarousel, paused, brands.length]);

  if (!useCarousel) {
    // Static row — ≤ 2 brands
    return (
      <div className="flex justify-center items-center gap-8 md:gap-12 flex-wrap">
        {brands.map((brand) => (
          <div
            key={brand.id}
            className="h-16 w-36 relative
              md:grayscale md:opacity-60 md:hover:grayscale-0 md:hover:opacity-100 md:transition-all md:duration-300"
          >
            <Image src={brand.imageUrl} alt="Marca" fill className="object-contain" sizes="144px" />
          </div>
        ))}
      </div>
    );
  }

  // Carousel — > 2 brands
  // We duplicate the list to allow seamless looping
  const doubled = [...brands, ...brands];
  // Each slide is 33.33% wide (3 visible). We shift by index * (100 / brands.length)%
  const slideWidthPct = 100 / VISIBLE;
  const translatePct = -(index * slideWidthPct);

  return (
    <div
      className="relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      {/* Track */}
      <div
        ref={trackRef}
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(${translatePct}%)` }}
      >
        {doubled.map((brand, i) => (
          <div
            key={`${brand.id}-${i}`}
            className="shrink-0 flex items-center justify-center px-4"
            style={{ width: `${slideWidthPct}%` }}
          >
            <div
              className="h-16 w-full max-w-[140px] relative
                md:grayscale md:opacity-60 md:hover:grayscale-0 md:hover:opacity-100 md:transition-all md:duration-300"
            >
              <Image
                src={brand.imageUrl}
                alt="Marca"
                fill
                className="object-contain"
                sizes="140px"
                loading="lazy"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-1.5 mt-5">
        {brands.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`rounded-full transition-all duration-300 ${
              i === index
                ? "bg-cerise-400 w-4 h-1.5"
                : "bg-gray-200 w-1.5 h-1.5 hover:bg-cerise-200"
            }`}
            aria-label={`Marca ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CategoryCarousel — small auto-advancing image carousel for a category card
// ---------------------------------------------------------------------------
function CategoryCarousel({
  products,
  categoryName,
}: {
  products: SerializedProductListItem[];
  categoryName: string;
}) {
  const images = products
    .filter((p) => p.mainImageUrl)
    .slice(0, 6)
    .map((p) => ({ url: p.mainImageUrl, alt: p.name }));

  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % Math.max(images.length, 1));
  }, [images.length]);

  useEffect(() => {
    if (images.length <= 1) return;
    const id = setInterval(next, 2500);
    return () => clearInterval(id);
  }, [images.length, next]);

  if (images.length === 0) {
    // Fallback placeholder (no products yet)
    return (
      <div className="w-full aspect-square rounded-xl bg-cerise-50 flex items-center justify-center">
        <span className="text-cerise-200 text-4xl">✿</span>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-warm-gray">
      {images.map((img, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <Image
            src={img.url}
            alt={img.alt ?? categoryName}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover"
            loading="lazy"
          />
        </div>
      ))}

      {/* Dot indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-10">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.preventDefault();
                setCurrent(i);
              }}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                i === current ? "bg-white scale-125" : "bg-white/50"
              }`}
              aria-label={`Imagen ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// HomePage
// ---------------------------------------------------------------------------
export function HomePage({
  featuredProducts,
  categories,
  brands,
  categoryProducts,
}: HomePageProps) {
  return (
    <div>
      {/* Hero */}
      <section className="bg-blush relative overflow-hidden">
        <div className="container-aurora grid lg:grid-cols-2 items-center gap-10 py-10 md:py-14 lg:py-13">
          <div className="animate-fade-up">
            <span className="text-cerise-600 text-[11px] font-semibold tracking-luxe mb-5 block">
              Aurora Belleza
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

      {/* Brands section */}
      {brands.length > 0 && (
        <section className="py-12 border-y border-gray-100 bg-white">
          <div className="container-aurora">
            <div className="text-center mb-8">
              <h2 className="font-serif text-2xl text-gray-800">Expertos en tu cuidado personal.</h2>
              <p className="text-sm text-gray-400 mt-1">Trabajamos con las mejores marcas para realzar tu belleza.</p>
            </div>
            <BrandsCarousel brands={brands} />
          </div>
        </section>
      )}

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

      {/* CTA / Newsletter */}
      <section className="py-24 md:py-32 bg-cerise-600 text-white">
        <div className="container-aurora text-center max-w-2xl mx-auto">
          <span className="text-white/60 text-[11px] font-semibold tracking-luxe mb-6 block">
            Aurora Belleza
          </span>
          <h2 className="text-3xl md:text-4xl leading-snug text-balance italic">
            &ldquo;La belleza es la forma en que te haces sentir a ti misma.&rdquo;
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
                  className="group block rounded-xl bg-white border border-gray-100 overflow-hidden transition-all hover:shadow-lg hover:border-cerise-200 hover:-translate-y-1"
                >
                  {/* Carousel */}
                  <CategoryCarousel
                    products={categoryProducts[cat.id] ?? []}
                    categoryName={cat.name}
                  />

                  {/* Label */}
                  <div className="px-4 py-3 text-center">
                    <h3 className="font-serif text-base group-hover:text-cerise-600 transition-colors">
                      {cat.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
