import "server-only";
import { cache } from "react";
import { createReader } from "@keystatic/core/reader";
import keystaticConfig from "../../keystatic.config";
import type { LineaDePrecio } from "./precios";

// Lee el contenido del CMS (archivos en /content) durante el build.
const reader = createReader(process.cwd(), keystaticConfig);

export type Categoria = "hombre" | "mujer";
export type Coleccion = "essentials" | "origen";

export type Producto = {
  slug: string;
  nombre: string;
  categoria: Categoria;
  coleccion: Coleccion;
  variante: string;
  color: string;
  etiqueta: string;
  linea: LineaDePrecio;
  descripcion: string;
  detalles: string[];
  imagenes: string[];
  tallas: { talla: string; disponible: boolean }[];
  agotado: boolean;
  nuevo: boolean;
  destacado: boolean;
  orden: number;
};

export const obtenerLineas = cache(async (): Promise<Record<string, LineaDePrecio>> => {
  const lineas = await reader.collections.lineasDePrecio.all();
  return Object.fromEntries(
    lineas.map(({ slug, entry }) => [
      slug,
      { slug, nombre: entry.nombre, unidad: entry.unidad, regular: entry.regular, pack2: entry.pack2, pack3: entry.pack3 },
    ]),
  );
});

export const obtenerProductos = cache(async (): Promise<Producto[]> => {
  const [entradas, lineas] = await Promise.all([reader.collections.productos.all(), obtenerLineas()]);
  return entradas
    .flatMap(({ slug, entry }) => {
      const linea = entry.lineaDePrecio ? lineas[entry.lineaDePrecio] : undefined;
      // Un producto sin línea de precio válida no se puede vender: no se publica
      if (!linea) return [];
      const imagenes = entry.imagenes.filter((i): i is string => Boolean(i));
      return [
        {
          slug,
          nombre: entry.nombre,
          categoria: entry.categoria,
          coleccion: entry.coleccion,
          variante: entry.variante,
          color: entry.color,
          etiqueta: `BOSQO ${entry.coleccion.toUpperCase()} · ${entry.variante.toUpperCase()}`,
          linea,
          descripcion: entry.descripcion,
          detalles: [...entry.detalles],
          imagenes,
          tallas: entry.tallas.map((t) => ({ ...t })),
          agotado: !entry.tallas.some((t) => t.disponible),
          nuevo: entry.nuevo,
          destacado: entry.destacado,
          orden: entry.orden ?? 10,
        },
      ];
    })
    .sort((a, b) => a.orden - b.orden || a.nombre.localeCompare(b.nombre, "es"));
});

export const obtenerProducto = cache(async (slug: string) =>
  (await obtenerProductos()).find((p) => p.slug === slug),
);

export const obtenerAjustes = cache(async () => {
  const ajustes = await reader.singletons.ajustes.readOrThrow();
  return { ...ajustes, whatsapp: ajustes.whatsapp.replace(/\D/g, "") };
});

export const obtenerPoliticas = cache(() => reader.singletons.politicas.readOrThrow());
