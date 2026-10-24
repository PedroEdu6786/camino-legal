"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { trackEvent } from "../../lib/analytics";
import NavPill from "./NavPill";

const navLinks = [
  { id: "home", href: "/", label: "Inicio" },
  { id: "services", href: "/servicios", label: "Servicios" },
  { id: "quotation", href: "/cotizaciones", label: "Cotizaciones" },
  { id: "about", href: "/nosotros", label: "Nosotros" },
  { id: "faq", href: "/preguntas", label: "Preguntas" },
];

function NavLabel({ label }: { label: string; active: boolean }) {
  return <span>{label}</span>;
}

export default function Navbar() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 bg-primary transition-shadow duration-300 ${scrolled ? "shadow-lg" : ""}`}>
      <nav className={`mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-8 transition-[padding] duration-300 ${scrolled ? "py-3 lg:py-4" : "py-4 lg:py-6"}`}>
        {/* Logo / Brand */}
        <Link data-analytics-event="navigation_click" data-analytics-action="nav.logo" data-analytics-source="navbar"  href="/" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <Image
            src="/camino-legal-white.png"
            alt="Camino Legal"
            width={140}
            height={40}
            className="h-8 md:h-10 lg:h-12 w-auto hover-wiggle"
          />
        </Link>

        {/* Desktop links + CTA */}
        <NavPill>
          <ul className="flex items-center gap-8 lg:gap-12">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  data-analytics-event="navigation_click" data-analytics-action={`nav.${link.id}`} data-analytics-source="navbar_desktop" href={link.href}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className="camino-nav-item text-sm lg:text-base font-medium text-white/70 transition-colors hover:text-white"
                >
                  <NavLabel label={link.label} active={isActive(link.href)} />
                </Link>
              </li>
            ))}
          </ul>
          <Link
            data-analytics-event="cta_click" data-analytics-action="nav.contact" data-analytics-source="navbar_desktop"  href="/contacto"
            aria-current={isActive("/contacto") ? "page" : undefined}
            onClick={() => setMenuOpen(false)}
            className="camino-nav-contact rounded-lg bg-white/10 hover:bg-white/20 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200"
          >
            <NavLabel label="Contáctanos" active={isActive("/contacto")} />
          </Link>
        </NavPill>

        {/* Mobile right: CTA pill + hamburger */}
        <div className="lg:hidden flex items-center gap-2">
          <Link
            data-analytics-event="cta_click" data-analytics-action="nav.contact" data-analytics-source="navbar_mobile_pill"  href="/contacto"
            aria-current={isActive("/contacto") ? "page" : undefined}
            onClick={() => setMenuOpen(false)}
            className="camino-nav-contact rounded-lg bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs font-semibold text-white transition-colors duration-200"
          >
            <NavLabel label="Contáctanos" active={isActive("/contacto")} />
          </Link>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-white"
            onClick={() => { trackEvent("utility_interaction", { action_id: "nav.menu", source_surface: "navbar_mobile_menu", utility: "menu", action: menuOpen ? "close" : "open" }); setMenuOpen(!menuOpen); }}
            aria-expanded={menuOpen}
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden border-t border-background/20 px-6 pb-4">
          <ul className="flex flex-col gap-4 pt-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  data-analytics-event="navigation_click" data-analytics-action={`nav.${link.id}`} data-analytics-source="navbar_mobile_menu" href={link.href}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className="camino-nav-item text-sm font-medium text-white/70 transition-colors hover:text-white"
                  onClick={() => setMenuOpen(false)}
                >
                  <NavLabel label={link.label} active={isActive(link.href)} />
                </Link>
              </li>
            ))}
            <li>
              <Link
                data-analytics-event="cta_click" data-analytics-action="nav.contact" data-analytics-source="navbar_mobile_menu"  href="/contacto"
                aria-current={isActive("/contacto") ? "page" : undefined}
                className="camino-nav-item text-sm font-medium text-white/70 transition-colors hover:text-white"
                onClick={() => setMenuOpen(false)}
              >
                <NavLabel label="Contacto" active={isActive("/contacto")} />
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
