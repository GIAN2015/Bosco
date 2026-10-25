import type { Metadata } from "next";
import { PaginaTexto } from "@/components/layout/PaginaTexto";
import { obtenerPoliticas } from "@/lib/catalogo";

export const metadata: Metadata = { title: "Términos y condiciones" };

export default async function PaginaTerminos() {
  const { terminos } = await obtenerPoliticas();
  return <PaginaTexto titulo="Términos y condiciones" texto={terminos} />;
}
