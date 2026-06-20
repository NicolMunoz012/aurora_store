"use client";
// =============================================================================
// components/ui/Navbar.tsx — Shop navigation bar
// =============================================================================

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState, useCallback, useEffect } from "react";

interface NavbarProps {
  cartItemCount: number;
  userEmail?: string | null;
  userRole?: string | null;
}

export function Navbar({ cartItemCount, userEmail, userRole }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");

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

  useEffect(() => {
    const timer = setTimeout(() => {
      if (pathname === "/catalog" || search) {
        pushSearch(search);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [search, pushSearch, pathname]);

  return (
    <header className="sticky top-0 z-50 w-full bg-cerise-600/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-1.5 sm:px-6">
        {/* Logo */}
        <Link href="/catalog" className="shrink-0">
          <Image src="/icon.png" alt="Aurora Belleza" width={90} height={28} priority />
        </Link>

        {/* Search bar */}
        <div className="relative flex-1 max-w-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-cerise-300"
          >
            <path
              fillRule="evenodd"
              d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
              clipRule="evenodd"
            />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar productos..."
            className="w-full rounded-md bg-cerise-700/50 py-1 pl-7 pr-3 text-xs text-white placeholder-cerise-200 transition-colors focus:bg-cerise-700 focus:outline-none focus:ring-1 focus:ring-white/30"
          />
        </div>

        {/* Right nav */}
        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link
            href="/catalog"
            className="hidden text-white/80 transition-colors hover:text-white sm:block"
          >
            Catálogo
          </Link>

          {/* Cart */}
          <Link
            href="/carrito"
            className="relative text-white/80 transition-colors hover:text-white"
            aria-label={`Carrito, ${cartItemCount} producto${cartItemCount !== 1 ? "s" : ""}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
              />
            </svg>
            {cartItemCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[9px] font-bold text-cerise-600">
                {cartItemCount > 99 ? "99+" : cartItemCount}
              </span>
            )}
          </Link>

          {/* Auth */}
          {userEmail ? (
            <>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="rounded bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-white/25"
                >
                  Admin
                </Link>
              )}
              <Link
                href="/perfil"
                className="text-white/80 transition-colors hover:text-white"
              >
                Mi cuenta
              </Link>
              <button
                onClick={handleSignOut}
                className="text-white/50 transition-colors hover:text-white"
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-white/80 transition-colors hover:text-white"
              >
                Ingresar
              </Link>
              <Link
                href="/registro"
                className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-cerise-600 transition-all hover:bg-white/90"
              >
                Registrarse
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
