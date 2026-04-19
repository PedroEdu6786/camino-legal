"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const navLinks = [
  { href: "#services", label: "Servicios" },
  { href: "#process", label: "Proceso" },
  { href: "#about", label: "Nosotros" },
  { href: "#reviews", label: "Clientes" },
  { href: "#faq", label: "Preguntas" },
  { href: "#contact", label: "Contacto" },
];

export default function Navbar() {
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
        <Link href="/" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <Image
            src="/camino-legal-white.png"
            alt="Camino Legal"
            width={140}
            height={40}
            className="h-8 md:h-10 lg:h-12 w-auto hover-wiggle"
          />
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-8 lg:gap-12">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm lg:text-base font-medium text-white/70 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile menu button */}
        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-white"
          onClick={() => setMenuOpen(!menuOpen)}
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
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-background/20 px-6 pb-4">
          <ul className="flex flex-col gap-4 pt-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block text-sm font-medium text-white/70 transition-colors hover:text-white"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
