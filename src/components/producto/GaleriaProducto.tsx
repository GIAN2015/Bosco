"use client";

import Image from "next/image";
import { useState, ViewTransition } from "react";

export function GaleriaProducto({ slug, imagenes, nombre }: { slug: string; imagenes: string[]; nombre: string }) {
  const [activa, setActiva] = useState(0);
  if (imagenes.length === 0) return <div className="aspect-[4/5] bg-arena" />;
  return (
    <div className="flex min-w-0 flex-col-reverse gap-3 lg:flex-row">
      <ul className="flex gap-2 overflow-x-auto lg:w-20 lg:flex-col lg:overflow-visible" aria-label="Fotos del producto">
        {imagenes.map((src, i) => (
          <li key={src} className="shrink-0">
            <button
              type="button"
              onClick={() => setActiva(i)}
              aria-label={`Ver foto ${i + 1} de ${imagenes.length}`}
              aria-current={i === activa}
              className="relative block aspect-[4/5] w-16 overflow-hidden border border-transparent bg-arena opacity-70 transition-[opacity,border-color] duration-300 ease-calida hover:opacity-100 aria-[current=true]:border-cacao aria-[current=true]:opacity-100 lg:w-20"
            >
              <Image src={src} alt="" fill sizes="80px" className="object-cover" />
            </button>
          </li>
        ))}
      </ul>
      <ViewTransition name={`foto-${slug}`} share="foto" default="none">
        <div className="relative aspect-[4/5] flex-1 overflow-hidden bg-arena">
          <Image
            key={imagenes[activa]}
            src={imagenes[activa]}
            alt={`${nombre}, foto ${activa + 1}`}
            fill
            preload={activa === 0}
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover motion-safe:animate-[desvanecer_0.5s_var(--ease-calida)]"
          />
        </div>
      </ViewTransition>
    </div>
  );
}
