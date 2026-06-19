"use client";
// =============================================================================
// components/ui/Navbar.tsx — Client Component navbar with cart count + auth state
// =============================================================================

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

interface NavbarProps {
  cartItemCount: number;
  userEmail?: string | null;
}

export function Navbar({ cartItemCount, userEmail }: NavbarProps) {
  const router = useRouter();

  async function handleSignOut() {
    await signOut({ redirect: false });
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white"
        >
          Aurora Belleza
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
          <Link href="/catalog" className="hover:text-zinc-900 dark:hover:text-white">
            Catálogo
          </Link>

          <Link
            href="/carrito"
            className="relative hover:text-zinc-900 dark:hover:text-white"
            aria-label={`Carrito, ${cartItemCount} producto${cartItemCount !== 1 ? "s" : ""}`}
          >
            🛒
            {cartItemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                {cartItemCount > 99 ? "99+" : cartItemCount}
              </span>
            )}
          </Link>

          {userEmail ? (
            <div className="flex items-center gap-4">
              <Link href="/perfil" className="hover:text-zinc-900 dark:hover:text-white">
                Mi cuenta
              </Link>
              <button
                onClick={handleSignOut}
                className="hover:text-zinc-900 dark:hover:text-white"
              >
                Salir
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/login" className="hover:text-zinc-900 dark:hover:text-white">
                Ingresar
              </Link>
              <Link
                href="/registro"
                className="rounded-full bg-zinc-900 px-4 py-1.5 text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Registrarse
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
