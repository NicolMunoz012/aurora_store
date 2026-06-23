"use client";
// =============================================================================
// components/ui/Navbar.tsx — Shop navigation bar (editorial style)
// =============================================================================

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState, useCallback, useEffect } from "react";
import { Search, User, ShoppingBag, Menu, LogOut } from "lucide-react";

interface NavbarProps {
  cartItemCount: number;
  userEmail?: string | null;
  userRole?: string | null;
  categories?: { id: string; name: string }[];
  announcementText?: string | null;
}

export function Navbar({ cartItemCount, userEmail, userRole, categories = [], announcementText }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = userRole === "ADMIN";

  async function handleSignOut() {
    await signOut({ redirect: false });
    router.push("/catalog");
    router.refresh();
  }

  const pushSearch = useCallback(
    (query: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (query) {
        params.set("search", query);
      } else {
        params.delete("search");
      }
      router.push(`/catalog?${params.toString()}`);
    },
    [router, searchParams],
  );

  // Only push search when user actively types (not on mount)
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    if (!hasInteracted) return;
    const timer = setTimeout(() => {
      pushSearch(search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search, pushSearch, hasInteracted]);

  return (
    <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-lg border-b border-gray-100/80">
      {/* Announcement bar */}
      {announcementText && (
        <div className="bg-blush text-cerise-600 text-[11px] tracking-luxe text-center py-2 font-medium">
          {announcementText}
        </div>
      )}

      {/* Main nav */}
      <nav className="container-aurora h-14 flex items-center justify-between gap-4">
        {/* Left: hamburger + logo + links */}
        <div className="flex items-center gap-2 md:gap-8 min-w-0">
          <button
            className="md:hidden p-1.5 -ml-1.5 text-gray-600"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menú"
          >
            <Menu className="size-5" />
          </button>

          <Link href="/" className="shrink-0">
            <Image src="/aurora.png" alt="Aurora Belleza" width={90} height={28} priority />
          </Link>

          <div className="hidden md:flex items-center gap-7 text-[12px] tracking-luxe font-medium text-gray-500">
            <Link href="/catalog" className="hover:text-cerise-600 transition-colors">Catálogo</Link>
            {categories.length > 0 && (
              <div className="relative group">
                <button className="flex items-center gap-1 hover:text-cerise-600 transition-colors">
                  CATEGORÍAS
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-3 transition-transform group-hover:rotate-180">
                    <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                  </svg>
                </button>
                {/* Dropdown */}
                <div className="absolute left-0 top-full pt-3 hidden group-hover:block z-50">
                  <div className="bg-white border border-gray-100 shadow-lg rounded-md py-4 min-w-[200px]">
                    <Link
                      href="/catalog"
                      className="block px-5 py-2 text-[12px] tracking-luxe text-gray-400 hover:text-cerise-600 transition-colors"
                    >
                      Ver todo
                    </Link>
                    <div className="my-2 border-t border-gray-50" />
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/catalog?categoryIds=${cat.id}`}
                        className="block px-5 py-2 text-sm text-gray-600 hover:text-cerise-600 hover:bg-blush/50 transition-colors"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {isAdmin && (
              <Link href="/admin" className="hover:text-cerise-600 transition-colors">Admin</Link>
            )}
          </div>
        </div>

        {/* Center: search (desktop) */}
        <div className="hidden md:block relative flex-1 max-w-xs">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-300" />
          <input
            type="search"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setHasInteracted(true); }}
            placeholder="Buscar productos..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200/80 rounded-full bg-gray-50/60 placeholder-gray-400 focus:outline-none focus:border-cerise-300 focus:bg-white focus:ring-2 focus:ring-cerise-50 transition-all"
          />
        </div>

        {/* Right: icons */}
        <div className="flex items-center gap-1 sm:gap-3 text-gray-600 shrink-0">
          {/* User */}
          {userEmail ? (
            <>
              <Link href="/perfil" className="p-2 hover:text-cerise-600 transition-colors" aria-label="Mi cuenta">
                <User className="size-[18px]" strokeWidth={1.5} />
              </Link>
              <button onClick={handleSignOut} className="p-2 text-gray-400 hover:text-cerise-600 transition-colors" aria-label="Salir">
                <LogOut className="size-[18px]" strokeWidth={1.5} />
              </button>
            </>
          ) : (
            <Link href="/login" className="p-2 hover:text-cerise-600 transition-colors" aria-label="Ingresar">
              <User className="size-[18px]" strokeWidth={1.5} />
            </Link>
          )}

          {/* Cart */}
          <Link href="/carrito" className="p-2 hover:text-cerise-600 transition-colors relative" aria-label="Carrito">
            <ShoppingBag className="size-[18px]" strokeWidth={1.5} />
            {cartItemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-cerise-600 text-white text-[10px] font-bold rounded-full size-4 grid place-items-center">
                {cartItemCount > 99 ? "99+" : cartItemCount}
              </span>
            )}
          </Link>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 py-4 container-aurora flex flex-col gap-3">
          {/* Mobile search */}
          <div className="relative mb-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-300" />
            <input
              type="search"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setHasInteracted(true); }}
              placeholder="Buscar productos..."
              className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-200 rounded-sm bg-warm-gray focus:outline-none focus:border-cerise-400"
            />
          </div>
          <Link href="/catalog" onClick={() => setMobileOpen(false)} className="text-sm tracking-luxe text-gray-600 hover:text-cerise-600">
            Catálogo
          </Link>
          {categories.length > 0 && (
            <div className="flex flex-col gap-1">
              <p className="text-[10px] tracking-luxe text-gray-400 uppercase mt-1">Categorías</p>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/catalog?categoryIds=${cat.id}`}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm text-gray-500 hover:text-cerise-600 pl-2"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}
          {userEmail && (
            <Link href="/perfil" onClick={() => setMobileOpen(false)} className="text-sm tracking-luxe text-gray-600 hover:text-cerise-600">
              Mi cuenta
            </Link>
          )}
          {isAdmin && (
            <Link href="/admin" onClick={() => setMobileOpen(false)} className="text-sm tracking-luxe text-gray-600 hover:text-cerise-600">
              Panel Admin
            </Link>
          )}
          {!userEmail && (
            <Link href="/login" onClick={() => setMobileOpen(false)} className="text-sm tracking-luxe text-gray-600 hover:text-cerise-600">
              Ingresar
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
