"use client";

import { useState } from "react";
import { IconoWhatsApp } from "@/components/Iconos";
import { enlaceWhatsApp, precioPorCantidad, soles, type LineaDePrecio } from "@/lib/precios";

const MAX_CANTIDAD = 10;

// Elige talla y cantidad y abre WhatsApp con el producto, la talla, la cantidad y el enlace del polo.
export function PedidoWhatsApp({
  slug,
  nombre,
  tallas,
  linea,
  whatsapp,
}: {
  slug: string;
  nombre: string;
  tallas: { talla: string; disponible: boolean }[];
  linea: LineaDePrecio;
  whatsapp: string;
}) {
  const [talla, setTalla] = useState<string | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const [aviso, setAviso] = useState(false);
  const total = precioPorCantidad(linea, cantidad);
  const ahorro = cantidad * linea.unidad - total;

  function pedir() {
    if (!talla) return setAviso(true);
    // El enlace sale de la dirección actual: funciona igual en Vercel, en local o en la red de casa
    const enlace = `${window.location.origin}/producto/${slug}`;
    const mensaje = `Hola BOSQO, quiero pedir:\n\n${nombre}\nTalla: ${talla}\nCantidad: ${cantidad}\n\n${enlace}`;
    window.open(enlaceWhatsApp(whatsapp, mensaje), "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-5">
      <fieldset>
        <legend className="etiqueta-campo">Talla</legend>
        <div className="flex flex-wrap gap-2">
          {tallas.map((t) => (
            <label key={t.talla} className={t.disponible ? "cursor-pointer" : "cursor-not-allowed"}>
              <input
                type="radio"
                name="talla"
                value={t.talla}
                disabled={!t.disponible}
                checked={talla === t.talla}
                onChange={() => {
                  setTalla(t.talla);
                  setAviso(false);
                }}
                className="peer sr-only"
              />
              <span className="grid h-11 min-w-12 place-items-center border border-linea px-3 text-sm transition-colors duration-300 ease-calida hover:border-cacao peer-checked:border-cacao peer-checked:bg-cacao peer-checked:text-crema peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-cacao peer-disabled:text-tenue/50 peer-disabled:line-through">
                {t.talla}
              </span>
            </label>
          ))}
        </div>
        {aviso && (
          <p role="alert" className="aparece mt-2 text-sm text-error">
            Elige una talla.
          </p>
        )}
      </fieldset>

      <div>
        <span className="etiqueta-campo" id="titulo-cantidad">
          Cantidad
        </span>
        <div className="flex items-center gap-4">
          <div className="flex h-11 items-center border border-linea" role="group" aria-labelledby="titulo-cantidad">
            <button type="button" className="h-full px-4 text-lg" aria-label="Restar una unidad" onClick={() => setCantidad((c) => Math.max(1, c - 1))}>
              −
            </button>
            <span className="w-8 text-center text-sm" aria-live="polite">
              {cantidad}
            </span>
            <button type="button" className="h-full px-4 text-lg" aria-label="Sumar una unidad" onClick={() => setCantidad((c) => Math.min(MAX_CANTIDAD, c + 1))}>
              +
            </button>
          </div>
          <p className="text-sm" aria-live="polite">
            Total: <strong className="font-medium">{soles(total)}</strong>
            {ahorro > 0 && <span key={cantidad} className="aparece ml-2 text-exito">Ahorras {soles(ahorro)}</span>}
          </p>
        </div>
      </div>

      <button type="button" onClick={pedir} className="boton w-full bg-[#1f7a4d] py-4 hover:bg-[#25915b]">
        <IconoWhatsApp className="size-5" />
        Pedir por WhatsApp
      </button>
    </div>
  );
}
