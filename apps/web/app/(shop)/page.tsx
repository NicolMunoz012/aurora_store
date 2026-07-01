export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// =============================================================================
// app/(shop)/page.tsx — Homepage wrapper (Server Component)
// Fetches data and passes to HomePage visual component.
//
// CONNECTION BUDGET: 3 parallel queries total (products + categories + brands).
// Category grouping is done in-memory from the already-fetched products list —
// there is NO per-category query loop. This was the root cause of P2037.
// =============================================================================

import { listProductsAction, listActiveCategoriesAction } from "@/lib/actions/catalog.actions";
import { listActiveBrandsAction } from "@/lib/actions/admin.brands.actions";
import { HomePage } from "@/components/shop/HomePage";
import type { SerializedProductListItem } from "@/lib/serializers";

export const metadata = {
  title: "LunaRose",
  description: "Productos de belleza seleccionados.",
};

export default async function ShopHomePage() {
  // 3 parallel queries — maximum connection usage for this page
  const [productsResult, categoriesResult, brandsResult] = await Promise.all([
    listProductsAction({}),
    listActiveCategoriesAction(),
    listActiveBrandsAction(),
  ]);

  const featuredProducts = productsResult.data ?? [];
  const categories = categoriesResult.data ?? [];
  const brands = brandsResult.data ?? [];

  // Group the already-fetched products by category — zero additional DB queries.
  // Previously this was a Promise.all(categories.map(() => listProductsAction(...)))
  // which fired N simultaneous queries (one per category), exhausting the connection
  // pool and causing P2037.
  const categoryProducts = Object.fromEntries(
    categories.map((cat) => [
      cat.id,
      featuredProducts.filter(
        (p: SerializedProductListItem) => p.category?.id === cat.id,
      ),
    ]),
  ) as Record<string, SerializedProductListItem[]>;

  return (
    <HomePage
      featuredProducts={featuredProducts}
      categories={categories}
      brands={brands}
      categoryProducts={categoryProducts}
    />
  );
}
