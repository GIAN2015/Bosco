import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Catalogo } from "../Catalogo";
import { FILTROS, esFiltro } from "../filtros";

// Solo existen las rutas generadas en el build; cualquier otra devuelve 404
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(FILTROS).map((filtro) => ({ filtro }));
}

export async function generateMetadata({ params }: PageProps<"/tienda/[filtro]">): Promise<Metadata> {
  const { filtro } = await params;
  if (!esFiltro(filtro)) return {};
  return { title: FILTROS[filtro].titulo, description: FILTROS[filtro].descripcion };
}

export default async function PaginaFiltro({ params }: PageProps<"/tienda/[filtro]">) {
  const { filtro } = await params;
  if (!esFiltro(filtro)) notFound();
  return <Catalogo filtro={filtro} />;
}
