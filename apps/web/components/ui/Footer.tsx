// =============================================================================
// components/ui/Footer.tsx — Server Component footer
// =============================================================================

export function Footer() {
  return (
    <footer className="mt-auto border-t border-zinc-200 bg-white py-8 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 text-sm text-zinc-500 sm:flex-row">
          <p>© {new Date().getFullYear()} Aurora Belleza. Todos los derechos reservados.</p>
          <p className="text-xs">IVA incluido en todos los precios.</p>
        </div>
      </div>
    </footer>
  );
}
