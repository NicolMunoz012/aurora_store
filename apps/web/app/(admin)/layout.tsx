// =============================================================================
// app/(admin)/layout.tsx — Admin area layout
// Middleware already protects /admin/* — this layout provides the UI shell.
// =============================================================================

import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-zinc-200 bg-zinc-900 px-6 py-3 dark:border-zinc-700">
        <div className="flex items-center justify-between">
          <Link href="/admin" className="text-sm font-bold text-white">
            Aurora Admin
          </Link>
          <nav className="flex gap-4 text-xs text-zinc-400">
            <Link href="/admin/productos" className="hover:text-white">Productos</Link>
            <Link href="/admin/pedidos" className="hover:text-white">Pedidos</Link>
            <Link href="/admin/inventario" className="hover:text-white">Inventario</Link>
            <Link href="/admin/configuracion" className="hover:text-white">Config</Link>
            <Link href="/" className="hover:text-white">← Tienda</Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 bg-zinc-50 dark:bg-zinc-950">{children}</main>
    </div>
  );
}
