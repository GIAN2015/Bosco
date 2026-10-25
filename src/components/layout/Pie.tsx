import Image from "next/image";
import Link from "next/link";
import { FormularioNewsletter } from "@/components/formularios/Formularios";
import { enlaceWhatsApp } from "@/lib/precios";
import type { obtenerAjustes } from "@/lib/catalogo";

type Ajustes = Awaited<ReturnType<typeof obtenerAjustes>>;

const COLUMNAS = [
  {
    titulo: "Tienda",
    enlaces: [
      { href: "/tienda", texto: "Ver todo" },
      { href: "/tienda/hombre", texto: "Hombre" },
      { href: "/tienda/mujer", texto: "Mujer" },
      { href: "/tienda/origen", texto: "Colección Origen" },
    ],
  },
  {
    titulo: "Ayuda",
    enlaces: [
      { href: "/guia-de-tallas", texto: "Guía de tallas" },
      { href: "/envios", texto: "Envíos" },
      { href: "/cambios-y-devoluciones", texto: "Cambios y devoluciones" },
      { href: "/contacto", texto: "Contacto" },
    ],
  },
  {
    titulo: "Legal",
    enlaces: [
      { href: "/terminos", texto: "Términos y condiciones" },
      { href: "/privacidad", texto: "Política de privacidad" },
      { href: "/libro-de-reclamaciones", texto: "Libro de reclamaciones" },
    ],
  },
];

export function Pie({ ajustes }: { ajustes: Ajustes }) {
  const redes = Object.entries(ajustes.redes).filter((r): r is [string, string] => Boolean(r[1]));
  return (
    <footer className="mt-auto bg-cacao text-crema">
      <div className="contenedor grid gap-12 py-16 lg:grid-cols-[1.2fr_2fr]">
        <div className="space-y-6">
          <Image src="/images/marca/wordmark-crema.png" alt="BOSQO" width={900} height={126} className="h-6 w-auto" />
          <p className="rotulo text-crema/80">Nuestro origen es estilo</p>
          <div className="max-w-sm space-y-3">
            <h2 className="rotulo">Únete al círculo BOSQO</h2>
            <p className="text-sm text-crema/80">Sé el primero en enterarte de nuevos drops y promociones.</p>
            <div className="[&_.boton]:bg-crema [&_.boton]:text-cacao [&_.boton:hover]:bg-arena [&_.campo]:border-crema/30 [&_.campo]:bg-transparent [&_.campo]:text-crema [&_.campo::placeholder]:text-crema/60">
              <FormularioNewsletter />
            </div>
          </div>
        </div>

        <div className="grid gap-10 sm:grid-cols-3">
          {COLUMNAS.map((c) => (
            <nav key={c.titulo} aria-label={c.titulo}>
              <h2 className="rotulo mb-4 text-crema/70">{c.titulo}</h2>
              <ul className="space-y-3 text-sm">
                {c.enlaces.map((e) => (
                  <li key={e.href}>
                    <Link href={e.href} className="hover:underline">
                      {e.texto}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      <div className="border-t border-crema/15">
        <div className="contenedor flex flex-col gap-4 py-6 text-xs text-crema/70 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} BOSQO · Moda contemporánea · Hecho en Perú</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span>Pagos: Yape · Plin</span>
            <a href={enlaceWhatsApp(ajustes.whatsapp)} target="_blank" rel="noopener noreferrer" className="hover:underline">
              WhatsApp
            </a>
            {redes.map(([red, url]) => (
              <a key={red} href={url} target="_blank" rel="noopener noreferrer" className="capitalize hover:underline">
                {red}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
