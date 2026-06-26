"use client";
// =============================================================================
// components/admin/AdminSidebar.tsx
// Desktop: fixed left sidebar.
// Mobile: sticky topbar with hamburger + slide-in drawer.
// =============================================================================

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  Tag,
  ShoppingBag,
  BarChart3,
  Settings,
  ArrowUpRight,
  LogOut,
  Star,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

const NAV_ITEMS = [
  { href: "/admin",              label: "Dashboard",    icon: LayoutDashboard, exact: true },
  { href: "/admin/productos",    label: "Productos",    icon: Package },
  { href: "/admin/categorias",   label: "Categorías",   icon: Tag },
  { href: "/admin/marcas",       label: "Marcas",       icon: Star },
  { href: "/admin/pedidos",      label: "Pedidos",      icon: ShoppingBag },
  { href: "/admin/inventario",   label: "Inventario",   icon: BarChart3 },
  { href: "/admin/configuracion",label: "Configuración",icon: Settings },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

// ─── Shared nav list (used in both sidebar & drawer) ─────────────────────────
function NavList({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex-1 p-3 space-y-0.5">
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href, item.exact);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all ${
              active
                ? "bg-blush text-cerise-600 font-semibold"
                : "text-gray-600 hover:bg-warm-gray hover:text-gray-800"
            }`}
          >
            <Icon className={`size-4 shrink-0 ${active ? "text-cerise-500" : "text-gray-400"}`} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

// ─── Desktop sidebar ──────────────────────────────────────────────────────────
function DesktopSidebar({
  pathname,
  onSignOut,
}: {
  pathname: string;
  onSignOut: () => void;
}) {
  return (
    <aside className="hidden md:flex w-64 bg-white border-r border-gray-100 flex-col h-full">
      {/* Brand */}
      <div className="p-6 border-b border-gray-100">
        <Link href="/admin">
          <Image src="/aurora.png" alt="LunaRose" width={100} height={32} />
        </Link>
        <p className="text-[11px] tracking-luxe text-gray-400 mt-2">Panel de administración</p>
      </div>

      <NavList pathname={pathname} />

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 space-y-2">
        <Link
          href="/catalog"
          className="flex items-center gap-2 text-[11px] tracking-luxe text-gray-400 font-medium hover:text-cerise-600 transition-colors"
        >
          Ver tienda <ArrowUpRight className="size-3" />
        </Link>
        <button
          onClick={onSignOut}
          className="flex items-center gap-2 text-[11px] tracking-luxe text-gray-400 font-medium hover:text-cerise-600 transition-colors w-full"
        >
          <LogOut className="size-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

// ─── Mobile topbar + drawer ───────────────────────────────────────────────────
function MobileNav({
  pathname,
  onSignOut,
}: {
  pathname: string;
  onSignOut: () => void;
}) {
  const [open, setOpen] = useState(false);

  // Close on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Current page label for the topbar title
  const currentItem = NAV_ITEMS.find((item) =>
    isActive(pathname, item.href, item.exact)
  );
  const pageLabel = currentItem?.label ?? "Admin";

  return (
    <>
      {/* Sticky topbar */}
      <header className="md:hidden sticky top-0 z-40 bg-white border-b border-gray-100 flex items-center gap-3 px-4 h-14">
        <button
          onClick={() => setOpen(true)}
          className="p-1.5 -ml-1 rounded-lg text-gray-500 hover:text-cerise-600 hover:bg-cerise-50 transition-colors"
          aria-label="Abrir menú"
        >
          <Menu className="size-5" />
        </button>

        <Link href="/admin" className="shrink-0">
          <Image src="/aurora.png" alt="Aurora" width={72} height={22} priority />
        </Link>

        <span className="text-[11px] tracking-luxe text-gray-400 font-medium ml-1 truncate">
          / {pageLabel}
        </span>
      </header>

      {/* Overlay */}
      <div
        onClick={() => setOpen(false)}
        className={`md:hidden fixed inset-0 z-[60] transition-all duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{
          background: "rgba(10,5,12,0.55)",
          backdropFilter: open ? "blur(4px)" : "none",
        }}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={`md:hidden fixed top-0 left-0 h-full w-[82vw] max-w-[320px] z-[70]
          bg-white flex flex-col shadow-2xl
          transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
          ${open ? "translate-x-0" : "-translate-x-full"}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menú admin"
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <Link href="/admin" onClick={() => setOpen(false)}>
              <Image src="/aurora.png" alt="LunaRose" width={80} height={24} />
            </Link>
            <p className="text-[10px] tracking-luxe text-gray-400 mt-1">Panel de administración</p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-full text-gray-400 hover:text-cerise-600 hover:bg-cerise-50 transition-colors"
            aria-label="Cerrar menú"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Nav items */}
        <div className="flex-1 overflow-y-auto overscroll-contain py-3">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href, item.exact);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center justify-between mx-3 px-4 py-3.5 rounded-xl text-sm transition-all mb-0.5 group ${
                  active
                    ? "bg-blush text-cerise-700 font-semibold"
                    : "text-gray-600 hover:bg-warm-gray hover:text-gray-800"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon
                    className={`size-4 shrink-0 ${
                      active ? "text-cerise-500" : "text-gray-400 group-hover:text-gray-600"
                    }`}
                  />
                  {item.label}
                </span>
                <ChevronRight
                  className={`size-4 ${
                    active ? "text-cerise-400" : "text-gray-200 group-hover:text-gray-400"
                  }`}
                />
              </Link>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-5 py-5 space-y-2">
          {/* Pill: go to store */}
          <Link
            href="/catalog"
            onClick={() => setOpen(false)}
            className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-gray-50 text-sm text-gray-600 hover:bg-cerise-50 hover:text-cerise-600 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ArrowUpRight className="size-4 text-gray-400" />
              Ver tienda
            </span>
            <ChevronRight className="size-4 text-gray-300" />
          </Link>

          {/* Sign out */}
          <button
            onClick={() => { setOpen(false); onSignOut(); }}
            className="flex items-center gap-2 w-full px-4 py-3 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut className="size-4" strokeWidth={1.5} />
            Cerrar sesión
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function AdminSidebar() {
  const pathname = usePathname();
  const [showSignOut, setShowSignOut] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <DesktopSidebar pathname={pathname} onSignOut={() => setShowSignOut(true)} />

      {/* Mobile topbar + drawer */}
      <MobileNav pathname={pathname} onSignOut={() => setShowSignOut(true)} />

      <ConfirmDialog
        open={showSignOut}
        title="Cerrar sesión"
        message="¿Estás segura de que deseas cerrar sesión del panel admin?"
        confirmLabel="Sí, cerrar sesión"
        cancelLabel="Quedarme"
        onConfirm={() => signOut({ callbackUrl: "/login" })}
        onCancel={() => setShowSignOut(false)}
      />
    </>
  );
}
