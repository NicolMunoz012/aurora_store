// =============================================================================
// components/ui/Footer.tsx — Store footer
// =============================================================================

import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-100 bg-white py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex flex-col items-center gap-1 sm:items-start">
            <span className="text-base font-bold text-cerise-700">
              Aurora <span className="font-light text-gray-500">Belleza</span>
            </span>
            <p className="text-xs text-gray-400">
              Productos de belleza al mejor precio.
            </p>
          </div>

          <nav className="flex gap-6 text-sm text-gray-500">
            <Link href="/catalog" className="hover:text-cerise-600 transition-colors">
              Catálogo
            </Link>
            <Link href="/login" className="hover:text-cerise-600 transition-colors">
              Mi cuenta
            </Link>
          </nav>

          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Aurora Belleza · IVA incluido
          </p>
        </div>
      </div>
    </footer>
  );
}
