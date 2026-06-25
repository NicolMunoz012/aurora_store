"use client";
// =============================================================================
// components/ui/Navbar.tsx — Shop navigation bar (editorial style)
// =============================================================================

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState, useCallback, useEffect, useRef } from "react";
import {
  Search,
  User,
  ShoppingBag,
  Menu,
  LogOut,
  X,
  Home,
  Grid3X3,
  ChevronRight,
  Settings,
  Tag,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface NavbarProps {
  cartItemCount: number;
  userEmail?: string | null;
  userRole?: string | null;
  categories?: { id: string; name: string }[];
  announcementText?: string | null;
}

export function Navbar({
  cartItemCount,
  userEmail,
  userRole,
  categories = [],
  announcementText,
}: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  const isAdmin = userRole === "ADMIN";

  // Close drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  async function confirmSignOut() {
    setShowSignOutDialog(false);
    await signOut({ redirect: false });
    router.push("/catalog");
    router.refresh();
  }

  function handleLogoClick() {
    setSearch("");
    setHasInteracted(false);
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
    if (!hasInteracted) return;
    const timer = setTimeout(() => {
      pushSearch(search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search, pushSearch, hasInteracted]);

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
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
              className="md:hidden p-1.5 -ml-1.5 text-gray-600 hover:text-cerise-600 transition-colors"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Menú"
              aria-expanded={mobileOpen}
            >
              <Menu className="size-5" />
            </button>

            <Link href="/" className="shrink-0" onClick={handleLogoClick}>
              <Image src="/aurora.png" alt="Aurora Belleza" width={90} height={28} priority />
            </Link>

            <div className="hidden md:flex items-center gap-7 text-[12px] tracking-luxe font-medium text-gray-500">
              <Link href="/catalog" className="hover:text-cerise-600 transition-colors">
                Catálogo
              </Link>
              {categories.length > 0 && (
                <div className="relative group">
                  <button className="flex items-center gap-1 hover:text-cerise-600 transition-colors">
                    CATEGORÍAS
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      className="size-3 transition-transform group-hover:rotate-180"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z"
                        clipRule="evenodd"
                      />
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
                <Link href="/admin" className="hover:text-cerise-600 transition-colors">
                  Admin
                </Link>
              )}
            </div>
          </div>

          {/* Center: search (desktop) */}
          <div className="hidden md:block relative flex-1 max-w-xs">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-300" />
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setHasInteracted(true);
              }}
              placeholder="Buscar productos..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200/80 rounded-full bg-gray-50/60 placeholder-gray-400 focus:outline-none focus:border-cerise-300 focus:bg-white focus:ring-2 focus:ring-cerise-50 transition-all"
            />
          </div>

          {/* Right: icons */}
          <div className="flex items-center gap-1 sm:gap-3 text-gray-600 shrink-0">
            {userEmail ? (
              <>
                <Link
                  href="/perfil"
                  className="p-2 hover:text-cerise-600 transition-colors"
                  aria-label="Mi cuenta"
                >
                  <User className="size-[18px]" strokeWidth={1.5} />
                </Link>
                <button
                  onClick={() => setShowSignOutDialog(true)}
                  className="p-2 text-gray-400 hover:text-cerise-600 transition-colors"
                  aria-label="Salir"
                >
                  <LogOut className="size-[18px]" strokeWidth={1.5} />
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="p-2 hover:text-cerise-600 transition-colors"
                aria-label="Ingresar"
              >
                <User className="size-[18px]" strokeWidth={1.5} />
              </Link>
            )}

            {/* Cart */}
            <Link
              href="/carrito"
              className="p-2 hover:text-cerise-600 transition-colors relative"
              aria-label="Carrito"
            >
              <ShoppingBag className="size-[18px]" strokeWidth={1.5} />
              {cartItemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-cerise-600 text-white text-[10px] font-bold rounded-full size-4 grid place-items-center">
                  {cartItemCount > 99 ? "99+" : cartItemCount}
                </span>
              )}
            </Link>
          </div>
        </nav>
      </header>

      {/* =====================================================================
          MOBILE DRAWER — full-screen side panel
          ===================================================================== */}

      {/* Overlay */}
      <div
        className={`fixed inset-0 z-[60] md:hidden transition-all duration-300 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ background: "rgba(10,5,12,0.55)", backdropFilter: mobileOpen ? "blur(4px)" : "none" }}
        onClick={closeMobile}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        className={`fixed top-0 left-0 h-full w-[84vw] max-w-[340px] z-[70] md:hidden
          bg-white flex flex-col shadow-2xl
          transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
        aria-modal="true"
        role="dialog"
        aria-label="Menú de navegación"
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <Link href="/" onClick={closeMobile}>
            <Image src="/aurora.png" alt="Aurora Belleza" width={80} height={24} priority />
          </Link>
          <button
            onClick={closeMobile}
            className="p-1.5 rounded-full text-gray-400 hover:text-cerise-600 hover:bg-cerise-50 transition-colors"
            aria-label="Cerrar menú"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 flex flex-col gap-6">

          {/* Search */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-300" />
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setHasInteracted(true);
              }}
              onKeyDown={(e) => e.key === "Enter" && closeMobile()}
              placeholder="Buscar productos..."
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-full bg-gray-50 placeholder-gray-400 focus:outline-none focus:border-cerise-300 focus:ring-2 focus:ring-cerise-50 transition-all"
            />
          </div>

          {/* Main nav links */}
          <nav className="flex flex-col gap-1">
            <p className="text-[10px] tracking-luxe text-gray-400 mb-1">NAVEGACIÓN</p>

            <MobileNavLink href="/" icon={<Home className="size-4" />} onClick={closeMobile}>
              Inicio
            </MobileNavLink>
            <MobileNavLink href="/catalog" icon={<Grid3X3 className="size-4" />} onClick={closeMobile}>
              Ver catálogo
            </MobileNavLink>
            {isAdmin && (
              <MobileNavLink href="/admin" icon={<Settings className="size-4" />} onClick={closeMobile}>
                Panel Admin
              </MobileNavLink>
            )}
          </nav>

          {/* Categories */}
          {categories.length > 0 && (
            <div className="flex flex-col gap-3">
              <p className="text-[10px] tracking-luxe text-gray-400">CATEGORÍAS</p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/catalog"
                  onClick={closeMobile}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium bg-cerise-50 text-cerise-700 hover:bg-cerise-100 transition-colors border border-cerise-100"
                >
                  <Tag className="size-3" />
                  Todo
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/catalog?categoryIds=${cat.id}`}
                    onClick={closeMobile}
                    className="inline-flex items-center px-3.5 py-2 rounded-full text-xs font-medium bg-gray-50 text-gray-700 hover:bg-cerise-50 hover:text-cerise-700 hover:border-cerise-100 transition-colors border border-gray-100"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Drawer footer — account actions */}
        <div className="border-t border-gray-100 px-5 py-5 flex flex-col gap-2">
          {userEmail ? (
            <>
              {/* User info pill */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blush mb-1">
                <div className="size-8 rounded-full bg-cerise-100 text-cerise-600 flex items-center justify-center font-semibold text-sm shrink-0">
                  {userEmail.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate">{userEmail}</p>
                  <p className="text-[11px] text-gray-400">{isAdmin ? "Administrador" : "Cliente"}</p>
                </div>
              </div>

              <Link
                href="/perfil"
                onClick={closeMobile}
                className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <User className="size-4 text-gray-400" strokeWidth={1.5} />
                  Mi cuenta
                </span>
                <ChevronRight className="size-4 text-gray-300" />
              </Link>

              <button
                onClick={() => { closeMobile(); setShowSignOutDialog(true); }}
                className="flex items-center gap-2.5 w-full px-4 py-3 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut className="size-4" strokeWidth={1.5} />
                Cerrar sesión
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                href="/login"
                onClick={closeMobile}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-cerise-600 text-white text-sm font-semibold tracking-wide hover:bg-cerise-700 transition-colors"
              >
                <User className="size-4" strokeWidth={1.5} />
                Ingresar
              </Link>
              <Link
                href="/registro"
                onClick={closeMobile}
                className="flex items-center justify-center w-full py-3 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:border-cerise-200 hover:text-cerise-600 transition-colors"
              >
                Crear cuenta
              </Link>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={showSignOutDialog}
        title="Cerrar sesión"
        message="¿Estás segura de que deseas cerrar sesión?"
        confirmLabel="Sí, cerrar sesión"
        cancelLabel="Quedarme"
        onConfirm={confirmSignOut}
        onCancel={() => setShowSignOutDialog(false)}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// MobileNavLink — row link with icon + chevron
// ---------------------------------------------------------------------------
function MobileNavLink({
  href,
  icon,
  children,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center justify-between px-4 py-3 rounded-xl text-sm text-gray-700 hover:bg-cerise-50 hover:text-cerise-700 transition-colors group"
    >
      <span className="flex items-center gap-3">
        <span className="text-gray-400 group-hover:text-cerise-500 transition-colors">{icon}</span>
        {children}
      </span>
      <ChevronRight className="size-4 text-gray-300 group-hover:text-cerise-400 transition-colors" />
    </Link>
  );
}
