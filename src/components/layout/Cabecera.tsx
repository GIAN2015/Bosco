"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { IconoCerrar, IconoMenu, IconoWhatsApp } from "@/components/Iconos";

export const ENLACES = [
  { href: "/tienda", texto: "Ver todo" },
  { href: "/tienda/hombre", texto: "Hombre" },
  { href: "/tienda/mujer", texto: "Mujer" },
  { href: "/tienda/essentials", texto: "Essentials" },
  { href: "/tienda/origen", texto: "Origen" },
  { href: "/guia-de-tallas", texto: "Guía de tallas" },
];

export function Cabecera({ anuncio, whatsapp }: { anuncio?: string; whatsapp: string }) {
  const ruta = usePathname();
  const [rutaMenu, setRutaMenu] = useState<string | null>(null);
  // El menú se cierra solo al navegar: queda abierto solo en la ruta donde se abrió
  const abierto = rutaMenu === ruta;

  return (
    <header className="sticky top-0 z-40 border-b border-linea bg-crema/95 backdrop-blur" style={{ viewTransitionName: "cabecera" }}>
      {anuncio && <p className="rotulo bg-cacao px-4 py-2 text-center text-crema">{anuncio}</p>}
      <div className="contenedor flex h-16 items-center justify-between gap-4">
        <button
          type="button"
          className="-ml-2 p-2 lg:hidden"
          aria-expanded={abierto}
          aria-controls="menu-movil"
          aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setRutaMenu(abierto ? null : ruta)}
        >
          {abierto ? <IconoCerrar className="size-6" /> : <IconoMenu className="size-6" />}
        </button>

        <Link href="/" aria-label="BOSQO, ir al inicio" className="shrink-0">
          <Image src="/images/marca/wordmark.png" alt="BOSQO" width={900} height={126} preload className="h-5 w-auto sm:h-6" />
        </Link>

        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-7">
            {ENLACES.map((e) => (
              <li key={e.href}>
                <Link
                  href={e.href}
                  aria-current={ruta === e.href ? "page" : undefined}
                  className="rotulo enlace-linea"
                >
                  {e.texto}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Escríbenos por WhatsApp"
          className="-mr-2 p-2 transition-transform duration-500 ease-calida hover:-translate-y-0.5"
        >
          <IconoWhatsApp className="size-6" />
        </a>
      </div>

      {abierto && (
        <nav id="menu-movil" aria-label="Menú móvil" className="aparece border-t border-linea lg:hidden">
          <ul className="contenedor divide-y divide-linea">
            {ENLACES.map((e) => (
              <li key={e.href}>
                <Link href={e.href} className="rotulo block py-4">
                  {e.texto}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
