// =============================================================================
// app/(admin)/admin/productos/[id]/page.tsx — Edit product (Req 16.7–16.9)
// =============================================================================

import { notFound } from "next/navigation";
import { AdminProductForm } from "@/components/admin/AdminProductForm";
import { getProductByIdAction, listActiveCategoriesAction } from "@/lib/actions/catalog.actions";

export const metadata = { title: "Editar producto — Admin" };
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductoPage({ params }: EditProductPageProps) {
  const { id } = await params;

  const [productResult, categoriesResult] = await Promise.all([
    getProductByIdAction(id),
    listActiveCategoriesAction(),
  ]);

  if (!productResult.data) notFound();

  const product = productResult.data;
  const categories = categoriesResult.data ?? [];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-xl font-bold text-zinc-900 dark:text-white">Editar producto</h1>
      <AdminProductForm
        categories={categories}
        mode="edit"
        productId={id}
        initialData={{
          name: product.name,
          description: product.description ?? "",
          retailPrice: product.retailPrice,
          wholesalePrice: product.wholesalePrice,
          stock: product.stock,
          lowStockAlert: product.lowStockAlert,
          minWholesaleQty: product.minWholesaleQty ?? undefined,
          categoryId: product.category.id,
          isActive: product.isActive,
          images: product.images,
        }}
      />
    </div>
  );
}