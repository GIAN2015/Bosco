import type { Metadata } from "next";
import { PaginaTexto } from "@/components/layout/PaginaTexto";
import { obtenerPoliticas } from "@/lib/catalogo";

export const metadata: Metadata = { title: "Envíos" };

export default async function PaginaEnvios() {
  const { envios } = await obtenerPoliticas();
  return <PaginaTexto titulo="Envíos" texto={envios} />;
}
