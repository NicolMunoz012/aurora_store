"use client";
// =============================================================================
// components/catalog/CategoryFilter.tsx (Req 5.3)
// Checkbox group — updates ?categoryIds= URL param (comma-separated).
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
      <legend className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
        Categorías
      </legend>
      <div className="flex flex-col gap-2">
        {categories.map((cat) => (
          <label
            key={cat.id}
            className="flex cursor-pointer items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400"
          >
            <input
              type="checkbox"
              checked={selected.has(cat.id)}
              onChange={() => toggle(cat.id)}
              className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500"
            />
            {cat.name}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
