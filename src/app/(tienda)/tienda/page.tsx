import type { Metadata } from "next";
import { Catalogo } from "./Catalogo";

export const metadata: Metadata = {
  title: "Tienda",
  description: "Polos oversize y croptops BOSQO: colecciones Essentials y Origen para hombre y mujer.",
};

export default function PaginaTienda() {
  return <Catalogo />;
}
