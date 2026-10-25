import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import type { Producto } from "@/lib/catalogo";
import { soles } from "@/lib/precios";
import { PrecioProducto } from "./PrecioProducto";

export function TarjetaProducto({ producto, preload = false }: { producto: Producto; preload?: boolean }) {
  const [portada, segunda] = producto.imagenes;
  const { linea } = producto;
  return (
    <article className="group revelar">
      <Link href={`/producto/${producto.slug}`} className="block">
        {/* Mismo nombre que la foto principal de la galería: la imagen viaja de la tarjeta al producto */}
        <ViewTransition name={`foto-${producto.slug}`} share="foto" default="none">
          <div className="relative aspect-[4/5] overflow-hidden bg-arena">
            {portada && (
              <Image
                src={portada}
                alt={producto.nombre}
                fill
                preload={preload}
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                className="object-cover transition-[opacity,scale] duration-700 ease-calida group-hover:scale-[1.04] group-hover:opacity-0"
              />
            )}
            {segunda && (
              <Image
                src={segunda}
                alt=""
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                className="scale-[1.04] object-cover opacity-0 transition-[opacity,scale] duration-700 ease-calida group-hover:scale-100 group-hover:opacity-100"
              />
            )}
            <div className="absolute left-2 top-2 flex flex-col gap-1">
              {producto.agotado ? (
                <span className="rotulo bg-cacao px-2 py-1 text-crema">Agotado</span>
              ) : (
                producto.nuevo && <span className="rotulo bg-crema px-2 py-1">Nuevo</span>
              )}
            </div>
          </div>
        </ViewTransition>
        <div className="space-y-1 pt-3 transition-transform duration-500 ease-calida group-hover:translate-x-1">
          <p className="text-[0.65rem] uppercase tracking-[0.2em] text-tenue">{producto.etiqueta}</p>
          <h3 className="font-display text-lg leading-tight font-semibold">{producto.nombre}</h3>
          <PrecioProducto linea={linea} />
          {linea.pack2 && <p className="text-xs text-tenue">Llevando 2: {soles(linea.pack2)}</p>}
        </div>
      </Link>
    </article>
  );
}

export function GrillaProductos({
  productos,
  preloadPrimeros = 0,
  columnas = 4,
}: {
  productos: Producto[];
  preloadPrimeros?: number;
  columnas?: 3 | 4;
}) {
  if (productos.length === 0) {
    return <p className="py-16 text-center text-tenue">Pronto tendremos nuevos productos aquí.</p>;
  }
  return (
    <div className={`grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 ${columnas === 4 ? "lg:grid-cols-4" : "lg:gap-x-6"}`}>
      {productos.map((p, i) => (
        <TarjetaProducto key={p.slug} producto={p} preload={i < preloadPrimeros} />
      ))}
    </div>
  );
}
