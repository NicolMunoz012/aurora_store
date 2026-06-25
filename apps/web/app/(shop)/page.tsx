export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// =============================================================================
// app/(shop)/page.tsx — Homepage wrapper (Server Component)
// Fetches data and passes to HomePage visual component.
// =============================================================================

import { listProductsAction, listActiveCategoriesAction } from "@/lib/actions/catalog.actions";
import { listActiveBrandsAction } from "@/lib/actions/admin.brands.actions";
import { HomePage } from "@/components/shop/HomePage";
import type { SerializedProductListItem } from "@/lib/serializers";

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

  // Build a map of categoryId → products (up to 6 images per category for the carousel)
  const categoryProductEntries = await Promise.all(
    categories.map(async (cat) => {
      const result = await listProductsAction({ categoryIds: [cat.id] });
      const products: SerializedProductListItem[] = result.data ?? [];
      return [cat.id, products] as const;
    }),
  );
  const categoryProducts = Object.fromEntries(categoryProductEntries) as Record<
    string,
    SerializedProductListItem[]
  >;

  return (
    <HomePage
      featuredProducts={featuredProducts}
      categories={categories}
      brands={brands}
      categoryProducts={categoryProducts}
    />
  );
}
