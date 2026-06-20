export const metadata = { title: "Editar producto — Admin" };
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// =============================================================================
// app/(admin)/admin/productos/[id]/page.tsx — Edit product
// =============================================================================

import { notFound } from "next/navigation";
import { AdminProductForm } from "@/components/admin/AdminProductForm";
import { getProductByIdAction, listActiveCategoriesAction } from "@/lib/actions/catalog.actions";

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
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Editar producto</h1>
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
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
    </div>
  );
}
