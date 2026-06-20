"use client";
// =============================================================================
// components/catalog/CategoryFilter.tsx — Category filter chips
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

  return (
    <fieldset>
      <legend className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
        Categorías
      </legend>
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const isActive = selected.has(cat.id);
          return (
            <button
              key={cat.id}
              onClick={() => toggle(cat.id)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                isActive
                  ? "bg-cerise-500 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-cerise-50 hover:text-cerise-700"
              }`}
              aria-pressed={isActive}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
