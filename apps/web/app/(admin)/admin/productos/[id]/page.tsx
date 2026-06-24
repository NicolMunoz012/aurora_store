export const metadata = { title: "Editar producto — Admin" };
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
    <div className="max-w-3xl">
      <h1 className="font-serif text-3xl mb-2 text-gray-900">Editar producto</h1>
      <p className="text-gray-400 text-sm mb-8">Modifica los datos del producto.</p>
      <div className="bg-white border border-gray-100 rounded-md p-8">
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
            discountPercentage: product.discountPercentage,
            brand: product.brand,
            categoryId: product.category?.id ?? "",
            isActive: product.isActive,
            images: product.images,
          }}
        />
      </div>
    </div>
  );
}
