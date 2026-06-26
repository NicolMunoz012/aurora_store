// =============================================================================
// components/ui/Footer.tsx — Store footer with social links
// =============================================================================

import Link from "next/link";
import Image from "next/image";

interface FooterProps {
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  tiktokUrl?: string | null;
}

export function Footer({ instagramUrl, facebookUrl, tiktokUrl }: FooterProps) {
  const hasSocials = instagramUrl || facebookUrl || tiktokUrl;

  return (
    <footer className="bg-cerise-600 text-white mt-16">
      <div className="container-aurora py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="col-span-2 md:col-span-1">
          <Image src="/footer.png" alt="LunaRose" width={80} height={26} className="mb-4 brightness-0 invert" />
          <p className="text-sm text-white/70 leading-relaxed max-w-xs">
            Productos de belleza seleccionados para potenciar tu brillo natural.
          </p>
          {hasSocials && (
            <div className="flex gap-3 mt-5">
              {instagramUrl && (
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors" aria-label="Instagram">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="size-5">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                  </svg>
                </a>
              )}
              {facebookUrl && (
                <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors" aria-label="Facebook">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="size-5">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                </a>
              )}
              {tiktokUrl && (
                <a href={tiktokUrl} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors" aria-label="TikTok">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.88 2.89 2.89 0 0 1-2.88-2.88 2.89 2.89 0 0 1 2.88-2.88c.28 0 .56.04.82.11v-3.5a6.37 6.37 0 0 0-.82-.05A6.34 6.34 0 0 0 3.15 15.6a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.4a8.16 8.16 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.83Z" />
                  </svg>
                </a>
              )}
            </div>
          )}
        </div>

        {/* Tienda */}
        <div>
          <h4 className="text-[11px] tracking-luxe font-semibold text-white/90 mb-5">Tienda</h4>
          <ul className="space-y-3 text-sm text-white/70">
            <li><Link href="/catalog" className="hover:text-white transition-colors">Catálogo</Link></li>
            <li><Link href="/carrito" className="hover:text-white transition-colors">Carrito</Link></li>
            <li><Link href="/registro" className="hover:text-white transition-colors">Crear cuenta</Link></li>
          </ul>
        </div>

        {/* Soporte */}
        <div>
          <h4 className="text-[11px] tracking-luxe font-semibold text-white/90 mb-5">Soporte</h4>
          <ul className="space-y-3 text-sm text-white/70">
            <li><Link href="/login" className="hover:text-white transition-colors">Mi cuenta</Link></li>
            <li><Link href="/pedidos" className="hover:text-white transition-colors">Mis pedidos</Link></li>
          </ul>
        </div>

        {/* Información */}
        <div>
          <h4 className="text-[11px] tracking-luxe font-semibold text-white/90 mb-5">Información</h4>
          <ul className="space-y-3 text-sm text-white/70">
            <li><span>Envíos a todo Colombia</span></li>
            <li><span>Atención por WhatsApp</span></li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="container-aurora py-6 border-t border-white/20 flex flex-col sm:flex-row justify-between items-center gap-3 text-[10px] tracking-luxe text-white/50">
        <span>© {new Date().getFullYear()} LunaRose. Todos los derechos reservados.</span>
        <span>Hecho con ♡ en Colombia</span>
      </div>
    </footer>
  );
}
