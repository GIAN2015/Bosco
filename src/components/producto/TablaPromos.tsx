import { soles, type LineaDePrecio } from "@/lib/precios";

export function TablaPromos({ linea, titulo = linea.nombre }: { linea: LineaDePrecio; titulo?: string }) {
  const filas = [
    { cantidad: 1, precio: linea.unidad },
    linea.pack2 && { cantidad: 2, precio: linea.pack2 },
    linea.pack3 && { cantidad: 3, precio: linea.pack3 },
  ].filter((f): f is { cantidad: number; precio: number } => Boolean(f));

  return (
    <table className="revelar w-full border border-linea bg-crema text-sm">
      <caption className="rotulo border border-b-0 border-linea bg-cacao py-3 text-crema">{titulo}</caption>
      <thead className="sr-only">
        <tr>
          <th scope="col">Cantidad</th>
          <th scope="col">Precio</th>
          <th scope="col">Ahorro</th>
        </tr>
      </thead>
      <tbody>
        {filas.map((f) => {
          const ahorro = f.cantidad * linea.unidad - f.precio;
          return (
            <tr key={f.cantidad} className="border-t border-linea first:border-t-0">
              <th scope="row" className="px-4 py-3 text-left font-normal">
                {f.cantidad} {f.cantidad === 1 ? "unidad" : "unidades"}
              </th>
              <td className="whitespace-nowrap px-4 py-3 text-right font-medium">{soles(f.precio)}</td>
              <td className="whitespace-nowrap px-4 py-3 text-right text-xs text-exito">{ahorro > 0 ? `Ahorras ${soles(ahorro)}` : ""}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
