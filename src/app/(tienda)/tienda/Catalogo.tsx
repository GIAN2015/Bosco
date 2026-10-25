import Link from "next/link";
import { EncabezadoPagina } from "@/components/layout/EncabezadoPagina";
import { GrillaProductos } from "@/components/producto/TarjetaProducto";
import { obtenerProductos } from "@/lib/catalogo";
import { FILTROS, type Filtro } from "./filtros";

export async function Catalogo({ filtro }: { filtro?: Filtro }) {
  const todos = await obtenerProductos();
  const productos = filtro ? todos.filter(FILTROS[filtro].incluye) : todos;
  const opciones = [{ href: "/tienda", texto: "Todo", activo: !filtro }].concat(
    Object.entries(FILTROS).map(([clave, f]) => ({ href: `/tienda/${clave}`, texto: f.titulo, activo: clave === filtro })),
  );

  return (
    <>
      <EncabezadoPagina
        titulo={filtro ? FILTROS[filtro].titulo : "Tienda"}
        rotulo={`${productos.length} ${productos.length === 1 ? "producto" : "productos"}`}
        descripcion={filtro ? FILTROS[filtro].descripcion : "Todas las piezas de BOSQO: Essentials y Origen, para hombre y mujer."}
        migas={filtro ? [{ href: "/tienda", texto: "Tienda" }] : []}
      />
      <div className="contenedor py-10">
        <nav aria-label="Filtrar productos" className="mb-10 flex flex-wrap gap-2">
          {opciones.map((o) => (
            <Link
              key={o.href}
              href={o.href}
              aria-current={o.activo ? "page" : undefined}
              className="rotulo border border-linea px-4 py-2 transition-colors duration-500 ease-calida hover:border-cacao aria-[current=page]:border-cacao aria-[current=page]:bg-cacao aria-[current=page]:text-crema"
            >
              {o.texto}
            </Link>
          ))}
        </nav>
        <GrillaProductos productos={productos} preloadPrimeros={4} />
      </div>
    </>
  );
}
