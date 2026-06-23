export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// =============================================================================
// app/(shop)/page.tsx — Homepage wrapper (Server Component)
// Fetches data and passes to HomePage visual component.
// =============================================================================

import { listProductsAction, listActiveCategoriesAction } from "@/lib/actions/catalog.actions";
import { HomePage } from "@/components/shop/HomePage";

export const metadata = {
  title: "Aurora Belleza — Tu ritual de belleza",
  description: "Productos de belleza seleccionados.",
};

export default async function ShopHomePage() {
  const [productsResult, categoriesResult] = await Promise.all([
    listProductsAction({}),
    listActiveCategoriesAction(),
  ]);

  const featuredProducts = productsResult.data ?? [];
  const categories = categoriesResult.data ?? [];

  return <HomePage featuredProducts={featuredProducts} categories={categories} />;
}
