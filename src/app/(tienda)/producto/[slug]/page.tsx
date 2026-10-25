import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FormularioAvisame } from "@/components/formularios/Formularios";
import { GaleriaProducto } from "@/components/producto/GaleriaProducto";
import { PedidoWhatsApp } from "@/components/producto/PedidoWhatsApp";
import { PrecioProducto } from "@/components/producto/PrecioProducto";
import { TablaPromos } from "@/components/producto/TablaPromos";
import { GrillaProductos } from "@/components/producto/TarjetaProducto";
import { obtenerAjustes, obtenerProducto, obtenerProductos } from "@/lib/catalogo";
import { soles } from "@/lib/precios";

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await obtenerProductos()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/producto/[slug]">): Promise<Metadata> {
  const producto = await obtenerProducto((await params).slug);
  if (!producto) return {};
  return {
    title: producto.nombre,
    description: producto.descripcion || `${producto.etiqueta} · ${soles(producto.linea.unidad)}`,
    openGraph: { images: producto.imagenes.slice(0, 1) },
  };
}

export default async function PaginaProducto({ params }: PageProps<"/producto/[slug]">) {
  const { slug } = await params;
  const [producto, productos, ajustes] = await Promise.all([obtenerProducto(slug), obtenerProductos(), obtenerAjustes()]);
  if (!producto) notFound();

  const relacionados = productos
    .filter((p) => p.slug !== producto.slug && p.categoria === producto.categoria)
    .slice(0, 4);
  const tallasAgotadas = producto.tallas.filter((t) => !t.disponible).map((t) => t.talla);
  const categoria = producto.categoria === "hombre" ? "Hombre" : "Mujer";

  // Datos estructurados para que Google muestre precio y disponibilidad
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: producto.nombre,
    description: producto.descripcion,
    image: producto.imagenes,
    brand: { "@type": "Brand", name: "BOSQO" },
    color: producto.color,
    offers: {
      "@type": "Offer",
      priceCurrency: "PEN",
      price: producto.linea.unidad,
      availability: producto.agotado ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <div className="contenedor py-8 lg:py-12">
        <nav aria-label="Migas de pan" className="mb-6 text-xs text-tenue">
          <ol className="flex flex-wrap gap-2">
            <li className="after:ml-2 after:content-['/']">
              <Link href="/" className="hover:underline">Inicio</Link>
            </li>
            <li className="after:ml-2 after:content-['/']">
              <Link href={`/tienda/${producto.categoria}`} className="hover:underline">{categoria}</Link>
            </li>
            <li aria-current="page">{producto.nombre}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-16">
          <GaleriaProducto slug={producto.slug} imagenes={producto.imagenes} nombre={producto.nombre} />

          <div className="space-y-8">
            <div className="space-y-3">
              <p className="rotulo text-tenue">{producto.etiqueta}</p>
              <h1 className="font-display text-3xl font-semibold sm:text-4xl">{producto.nombre}</h1>
              <PrecioProducto linea={producto.linea} grande />
              {producto.color && <p className="text-sm text-tenue">Color: {producto.color}</p>}
            </div>

            {producto.agotado ? (
              <p className="border border-cacao p-3 text-sm">Este producto está agotado por ahora.</p>
            ) : (
              <PedidoWhatsApp
                slug={producto.slug}
                nombre={producto.nombre}
                tallas={producto.tallas}
                linea={producto.linea}
                whatsapp={ajustes.whatsapp}
              />
            )}

            <div className="space-y-2 text-sm">
              {ajustes.notaTallas && <p className="text-tenue">{ajustes.notaTallas}</p>}
              <Link href="/guia-de-tallas" className="rotulo inline-block border-b border-cacao pb-1">
                Ver guía de tallas
              </Link>
            </div>

            {producto.linea.pack2 && <TablaPromos linea={producto.linea} titulo={`Promo ${producto.linea.nombre}`} />}

            {(producto.descripcion || producto.detalles.length > 0) && (
              <div className="space-y-4 border-t border-linea pt-8">
                <h2 className="rotulo">Descripción</h2>
                {producto.descripcion && <p className="leading-relaxed">{producto.descripcion}</p>}
                {producto.detalles.length > 0 && (
                  <ul className="list-inside list-disc space-y-1 text-sm text-tenue">
                    {producto.detalles.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {tallasAgotadas.length > 0 && (
              <div className="space-y-4 border-t border-linea pt-8">
                <h2 className="rotulo">¿No está tu talla?</h2>
                <p className="text-sm text-tenue">Déjanos tus datos y te avisamos cuando vuelva.</p>
                <FormularioAvisame producto={producto.slug} tallas={tallasAgotadas} />
              </div>
            )}
          </div>
        </div>
      </div>

      {relacionados.length > 0 && (
        <section className="contenedor border-t border-linea py-16" aria-labelledby="titulo-relacionados">
          <h2 id="titulo-relacionados" className="titulo mb-8 text-xl">
            También te puede gustar
          </h2>
          <GrillaProductos productos={relacionados} />
        </section>
      )}
    </>
  );
}
