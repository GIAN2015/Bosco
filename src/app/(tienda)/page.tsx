import Image from "next/image";
import Link from "next/link";
import { GrillaProductos } from "@/components/producto/TarjetaProducto";
import { TablaPromos } from "@/components/producto/TablaPromos";
import { obtenerAjustes, obtenerLineas, obtenerProductos } from "@/lib/catalogo";

const REGIONES = [
  { slug: "costa", nombre: "Costa", texto: "El mar, la brisa y la luz del litoral.", color: "text-costa" },
  { slug: "andes", nombre: "Andes", texto: "Montañas, sol y la fuerza de la sierra.", color: "text-andes" },
  { slug: "selva", nombre: "Selva", texto: "La energía verde de la Amazonía.", color: "text-selva" },
];

// Escalona las animaciones de entrada (clase .entrada en globals.css)
const retraso = (segundos: number) => ({ "--retraso": `${segundos}s` }) as React.CSSProperties;

export default async function Inicio() {
  const [ajustes, productos, lineas] = await Promise.all([obtenerAjustes(), obtenerProductos(), obtenerLineas()]);
  const destacados = productos.filter((p) => p.destacado);
  const portadaDe = (filtro: (p: (typeof productos)[number]) => boolean) =>
    productos.find((p) => filtro(p) && p.imagenes[0])?.imagenes[0];

  const colecciones = [
    {
      href: "/tienda/essentials",
      nombre: "Essentials",
      texto: "Básicos premium y atemporales. Línea permanente.",
      imagenes: [portadaDe((p) => p.coleccion === "essentials" && p.categoria === "hombre"), portadaDe((p) => p.coleccion === "essentials" && p.categoria === "mujer")],
    },
    {
      href: "/tienda/origen",
      nombre: "Origen",
      texto: "Identidad peruana contemporánea: Costa, Andes y Selva.",
      imagenes: [portadaDe((p) => p.coleccion === "origen" && p.categoria === "hombre"), portadaDe((p) => p.coleccion === "origen" && p.categoria === "mujer")],
    },
  ];

  return (
    <>
      <section aria-label="Portada" className="relative">
        {ajustes.heroImagen && (
          <div className="overflow-hidden">
            <Image
              src={ajustes.heroImagen}
              alt="Modelos con polo BOSQO Essentials negro y croptop blanco frente a paisajes de Costa, Andes y Selva"
              width={2000}
              height={1125}
              preload
              sizes="100vw"
              className="entrada-imagen aspect-[16/9] w-full object-cover"
            />
          </div>
        )}
        <div className="contenedor flex flex-col items-center gap-6 py-12 text-center">
          {ajustes.heroTitulo && (
            <h1 className="entrada titulo text-2xl sm:text-4xl" style={retraso(0.15)}>
              {ajustes.heroTitulo}
            </h1>
          )}
          {ajustes.heroTexto && (
            <p className="entrada max-w-xl text-tenue" style={retraso(0.3)}>
              {ajustes.heroTexto}
            </p>
          )}
          <div className="entrada flex flex-wrap justify-center gap-3" style={retraso(0.45)}>
            <Link href="/tienda/hombre" className="boton">
              Comprar Hombre
            </Link>
            <Link href="/tienda/mujer" className="boton-borde">
              Comprar Mujer
            </Link>
          </div>
        </div>
      </section>

      {ajustes.beneficios.length > 0 && (
        <section aria-label="Beneficios" className="border-y border-linea bg-arena/60">
          <ul className="contenedor grid grid-cols-2 gap-4 py-5 text-center lg:grid-cols-4">
            {ajustes.beneficios.map((b) => (
              <li key={b} className="rotulo revelar">
                {b}
              </li>
            ))}
          </ul>
        </section>
      )}

      {destacados.length > 0 && (
        <section className="contenedor py-20" aria-labelledby="titulo-drop">
          <div className="revelar mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="rotulo text-tenue">Nuevo drop</p>
              <h2 id="titulo-drop" className="titulo mt-2 text-2xl sm:text-3xl">
                Colección Origen
              </h2>
            </div>
            <Link href="/tienda" className="group/ver rotulo inline-flex items-center gap-2 border-b border-cacao pb-1">
              Ver todo
              <span aria-hidden="true" className="transition-transform duration-500 ease-calida group-hover/ver:translate-x-1.5">
                →
              </span>
            </Link>
          </div>
          <GrillaProductos productos={destacados} columnas={destacados.length % 3 === 0 ? 3 : 4} />
        </section>
      )}

      <section className="bg-white/50 py-20" aria-labelledby="titulo-regiones">
        <div className="contenedor">
          <div className="revelar">
            <p className="rotulo text-center text-tenue">BOSQO Origen</p>
            <h2 id="titulo-regiones" className="titulo mt-2 text-center text-2xl sm:text-3xl">
              Tres regiones, un estilo
            </h2>
          </div>
          <ul className="mt-12 grid gap-10 sm:grid-cols-3">
            {REGIONES.map((r) => (
              <li key={r.slug} className="group revelar">
                <Link href="/tienda/origen" className="flex flex-col items-center gap-4 text-center">
                  <Image
                    src={`/images/marca/origen-${r.slug}.webp`}
                    alt={`Logo BOSQO ${r.nombre}`}
                    width={500}
                    height={460}
                    className="h-32 w-auto object-contain transition-transform duration-700 ease-calida group-hover:-translate-y-2 group-hover:scale-105"
                  />
                  <p className={`text-sm ${r.color}`}>{r.texto}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="contenedor grid gap-6 py-20 md:grid-cols-2" aria-label="Colecciones">
        {colecciones.map((c) => (
          <Link key={c.href} href={c.href} className="group revelar relative block overflow-hidden bg-arena">
            <div className="grid aspect-[4/3] grid-cols-2">
              {c.imagenes.map(
                (src) =>
                  src && (
                    <div key={src} className="relative">
                      <Image src={src} alt="" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover transition-transform duration-1000 ease-calida group-hover:scale-105" />
                    </div>
                  ),
              )}
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-cacao/90 to-transparent p-6 pt-16 text-crema">
              <h2 className="titulo text-2xl">{c.nombre}</h2>
              <p className="mt-1 text-sm text-crema/85">{c.texto}</p>
              <span className="rotulo mt-4 inline-flex items-center gap-2 border-b border-crema pb-1">
                Explorar
                <span aria-hidden="true" className="transition-transform duration-500 ease-calida group-hover:translate-x-1.5">
                  →
                </span>
              </span>
            </div>
          </Link>
        ))}
      </section>

      <section className="border-t border-linea bg-arena/40 py-20" aria-labelledby="titulo-promos">
        <div className="contenedor">
          <div className="revelar">
            <p className="rotulo text-center text-tenue">Promociones</p>
            <h2 id="titulo-promos" className="titulo mt-2 text-center text-2xl sm:text-3xl">
              Lleva más, paga menos
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-center text-sm text-tenue">
              Combina colores y diseños de una misma línea y pide por WhatsApp: te aplicamos la promo al confirmar.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {Object.values(lineas).map((l) => (
              <TablaPromos key={l.slug} linea={l} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
