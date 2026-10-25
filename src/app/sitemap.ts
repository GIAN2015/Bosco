import type { MetadataRoute } from "next";
import { obtenerProductos } from "@/lib/catalogo";
import { URL_SITIO } from "@/lib/sitio";
import { FILTROS } from "./(tienda)/tienda/filtros";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const productos = await obtenerProductos();
  const rutas = [
    "/",
    "/tienda",
    ...Object.keys(FILTROS).map((f) => `/tienda/${f}`),
    ...productos.map((p) => `/producto/${p.slug}`),
    "/guia-de-tallas",
    "/contacto",
    "/envios",
    "/cambios-y-devoluciones",
    "/libro-de-reclamaciones",
    "/privacidad",
    "/terminos",
  ];
  return rutas.map((ruta) => ({ url: `${URL_SITIO}${ruta}` }));
}
