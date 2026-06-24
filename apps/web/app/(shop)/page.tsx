export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// =============================================================================
// app/(shop)/page.tsx — Homepage wrapper (Server Component)
// Fetches data and passes to HomePage visual component.
// =============================================================================

import { listProductsAction, listActiveCategoriesAction } from "@/lib/actions/catalog.actions";
import { listActiveBrandsAction } from "@/lib/actions/admin.brands.actions";
import { HomePage } from "@/components/shop/HomePage";

export const metadata = {
  title: "Aurora Belleza",
  description: "Productos de belleza seleccionados.",
};

export default async function ShopHomePage() {
  const [productsResult, categoriesResult, brandsResult] = await Promise.all([
    listProductsAction({}),
    listActiveCategoriesAction(),
    listActiveBrandsAction(),
  ]);

  const featuredProducts = productsResult.data ?? [];
  const categories = categoriesResult.data ?? [];
  const brands = brandsResult.data ?? [];

  return <HomePage featuredProducts={featuredProducts} categories={categories} brands={brands} />;
}
