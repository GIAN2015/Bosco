// Lógica de precios compartida entre servidor y navegador (sin dependencias).

export type LineaDePrecio = {
  slug: string;
  nombre: string;
  unidad: number;
  regular: number | null;
  pack2: number | null;
  pack3: number | null;
};

// Precio más bajo para n unidades de una misma línea combinando packs de 1, 2 y 3.
export function precioPorCantidad(linea: LineaDePrecio, n: number): number {
  const packs: [number, number][] = [[1, linea.unidad]];
  if (linea.pack2) packs.push([2, linea.pack2]);
  if (linea.pack3) packs.push([3, linea.pack3]);
  const mejor = [0];
  for (let i = 1; i <= n; i++) {
    mejor[i] = Infinity;
    for (const [unidades, precio] of packs) {
      if (unidades <= i) mejor[i] = Math.min(mejor[i], mejor[i - unidades] + precio);
    }
  }
  return mejor[n];
}

// Porcentaje de descuento frente al precio regular, o null si no hay descuento.
export function descuento(linea: LineaDePrecio): number | null {
  if (!linea.regular || linea.regular <= linea.unidad) return null;
  return Math.round((1 - linea.unidad / linea.regular) * 100);
}

export function soles(monto: number): string {
  return `S/ ${Number.isInteger(monto) ? monto : monto.toFixed(2)}`;
}

export function enlaceWhatsApp(numero: string, texto?: string): string {
  return `https://wa.me/${numero}${texto ? `?text=${encodeURIComponent(texto)}` : ""}`;
}
