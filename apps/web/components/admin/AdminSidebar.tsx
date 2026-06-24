"use client";
// =============================================================================
// components/admin/AdminSidebar.tsx — Admin sidebar (Lovable editorial style)
// =============================================================================

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, Package, Tag, ShoppingBag, BarChart3, Settings, ArrowUpRight, LogOut } from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/categorias", label: "Categorías", icon: Tag },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag },
  { href: "/admin/inventario", label: "Inventario", icon: BarChart3 },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <aside className="hidden md:flex w-64 bg-white border-r border-gray-100 flex-col">
      {/* Brand */}
      <div className="p-6 border-b border-gray-100">
        <Link href="/admin">
          <Image src="/aurora.png" alt="Aurora Belleza" width={100} height={32} />
        </Link>
        <p className="text-[11px] tracking-luxe text-gray-400 mt-2">Panel de administración</p>
      </div>

      {/* Navigation */}
      <nav className="p-3 flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href, item.exact);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-sm text-sm transition-colors ${
                active
                  ? "bg-blush text-cerise-600 font-medium"
                  : "text-gray-600 hover:bg-warm-gray"
              }`}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer: store link + logout */}
      <div className="p-4 border-t border-gray-100 space-y-2">
        <Link
          href="/catalog"
          className="flex items-center gap-2 text-[11px] tracking-luxe text-gray-400 font-medium hover:text-cerise-600 transition-colors"
        >
          Ver tienda <ArrowUpRight className="size-3" />
        </Link>
        <button
          onClick={() => {
            if (confirm("¿Deseas cerrar sesión?")) {
              signOut({ callbackUrl: "/login" });
            }
          }}
          className="flex items-center gap-2 text-[11px] tracking-luxe text-gray-400 font-medium hover:text-cerise-600 transition-colors w-full"
        >
          <LogOut className="size-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
