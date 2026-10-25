import type { Producto } from "@/lib/catalogo";

export const FILTROS = {
  hombre: {
    titulo: "Hombre",
    descripcion: "Polos oversize de las colecciones Essentials y Origen.",
    incluye: (p: Producto) => p.categoria === "hombre",
  },
  mujer: {
    titulo: "Mujer",
    descripcion: "Croptops oversize de las colecciones Essentials y Origen.",
    incluye: (p: Producto) => p.categoria === "mujer",
  },
  essentials: {
    titulo: "Essentials",
    descripcion: "La línea permanente de BOSQO: básicos premium, minimalistas y atemporales.",
    incluye: (p: Producto) => p.coleccion === "essentials",
  },
  origen: {
    titulo: "Origen",
    descripcion: "Identidad peruana contemporánea inspirada en la Costa, los Andes y la Selva.",
    incluye: (p: Producto) => p.coleccion === "origen",
  },
};

export type Filtro = keyof typeof FILTROS;

export const esFiltro = (valor: string): valor is Filtro => valor in FILTROS;
