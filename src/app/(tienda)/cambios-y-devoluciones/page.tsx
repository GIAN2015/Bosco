import type { Metadata } from "next";
import { PaginaTexto } from "@/components/layout/PaginaTexto";
import { obtenerPoliticas } from "@/lib/catalogo";

export const metadata: Metadata = { title: "Cambios y devoluciones" };

export default async function PaginaCambios() {
  const { cambios } = await obtenerPoliticas();
  return <PaginaTexto titulo="Cambios y devoluciones" texto={cambios} />;
}
