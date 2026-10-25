import { descuento, soles, type LineaDePrecio } from "@/lib/precios";

export function PrecioProducto({ linea, grande = false }: { linea: LineaDePrecio; grande?: boolean }) {
  const porcentaje = descuento(linea);
  return (
    <p className={`flex flex-wrap items-baseline gap-x-2 gap-y-1 ${grande ? "text-xl" : "text-sm"}`}>
      <span className="font-medium">{soles(linea.unidad)}</span>
      {porcentaje && linea.regular && (
        <>
          <s className={`text-tenue/80 ${grande ? "text-base" : "text-xs"}`}>
            <span className="sr-only">Precio regular: </span>
            {soles(linea.regular)}
          </s>
          <span className={`bg-cacao px-1.5 py-0.5 font-medium text-crema ${grande ? "text-xs" : "text-[0.6rem]"}`}>
            -{porcentaje}%
          </span>
        </>
      )}
    </p>
  );
}
