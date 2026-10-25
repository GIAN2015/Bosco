import type { Metadata } from "next";
import { PaginaTexto } from "@/components/layout/PaginaTexto";
import { obtenerPoliticas } from "@/lib/catalogo";

export const metadata: Metadata = { title: "Política de privacidad" };

export default async function PaginaPrivacidad() {
  const { privacidad } = await obtenerPoliticas();
  return <PaginaTexto titulo="Política de privacidad" texto={privacidad} />;
}
