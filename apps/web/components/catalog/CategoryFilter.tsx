"use client";
// =============================================================================
// components/catalog/CategoryFilter.tsx — Category filter pills (editorial)
// =============================================================================

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { CategoryRecord } from "@aurora/shared";

interface CategoryFilterProps {
  categories: Pick<CategoryRecord, "id" | "name">[];
}

export function CategoryFilter({ categories }: CategoryFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selected = new Set(
    (searchParams.get("categoryIds") ?? "").split(",").filter(Boolean),
  );

  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    const params = new URLSearchParams(searchParams.toString());
    if (next.size > 0) {
      params.set("categoryIds", Array.from(next).join(","));
    } else {
      params.delete("categoryIds");
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  function clearAll() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("categoryIds");
    params.delete("discount");
    router.push(`${pathname}?${params.toString()}`);
  }

  const hasFilter = selected.size > 0;

  // Discount filter from URL
  const isDiscountActive = searchParams.get("discount") === "true";

  function toggleDiscount() {
    const params = new URLSearchParams(searchParams.toString());
    if (isDiscountActive) {
      params.delete("discount");
    } else {
      params.set("discount", "true");
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={clearAll}
        className={`px-4 py-2 text-[11px] tracking-luxe font-semibold border rounded-full transition-colors ${
          !hasFilter && !isDiscountActive
            ? "bg-gray-900 text-white border-gray-900"
            : "border-gray-200 text-gray-500 hover:border-cerise-300 hover:text-cerise-600"
        }`}
      >
        Todos
      </button>
      <button
        onClick={toggleDiscount}
        className={`px-4 py-2 text-[11px] tracking-luxe font-semibold border rounded-full transition-colors ${
          isDiscountActive
            ? "bg-cerise-600 text-white border-cerise-600"
            : "border-gray-200 text-gray-500 hover:border-cerise-300 hover:text-cerise-600"
        }`}
      >
        En promoción
      </button>
      {categories.map((cat) => {
        const isActive = selected.has(cat.id);
        return (
          <button
            key={cat.id}
            onClick={() => toggle(cat.id)}
            className={`px-4 py-2 text-[11px] tracking-luxe font-semibold border rounded-full transition-colors ${
              isActive
                ? "bg-gray-900 text-white border-gray-900"
                : "border-gray-200 text-gray-500 hover:border-cerise-300 hover:text-cerise-600"
            }`}
            aria-pressed={isActive}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}
