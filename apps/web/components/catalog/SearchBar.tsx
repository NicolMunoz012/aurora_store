"use client";
// =============================================================================
// components/catalog/SearchBar.tsx (Req 5.4)
// Controlled input with debounce — updates ?search= URL param.
// =============================================================================

import { useCallback, useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface SearchBarProps {
  placeholder?: string;
}

export function SearchBar({ placeholder = "Buscar productos..." }: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("search") ?? "");

  // Debounce: push URL update 400ms after last keystroke
  const updateSearch = useCallback(
    (query: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (query) {
        params.set("search", query);
      } else {
        params.delete("search");
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  useEffect(() => {
    const timer = setTimeout(() => updateSearch(value), 400);
    return () => clearTimeout(timer);
  }, [value, updateSearch]);

  return (
    <div className="relative w-full max-w-md">
      <label htmlFor="product-search" className="sr-only">
        Buscar productos
      </label>
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-400">
        🔍
      </span>
      <input
        id="product-search"
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full border border-zinc-300 bg-white py-2 pl-9 pr-4 text-sm text-zinc-800 placeholder-zinc-400 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
      />
    </div>
  );
}
