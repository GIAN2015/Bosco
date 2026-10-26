"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

export type Diapositiva = { imagen: string; alt: string; enlace: string | null };

const INTERVALO_MS = 6000;

// prefers-reduced-motion: sin avance automático para quien lo pidió en su sistema
function suscribirMovimiento(avisar: () => void) {
  const consulta = window.matchMedia("(prefers-reduced-motion: reduce)");
  consulta.addEventListener("change", avisar);
  return () => consulta.removeEventListener("change", avisar);
}
const movimientoReducido = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function CarruselPortada({ diapositivas }: { diapositivas: Diapositiva[] }) {
  const [actual, setActual] = useState(0);
  const [pausadoPorUsuario, setPausadoPorUsuario] = useState(false);
  const [enfocado, setEnfocado] = useState(false);
  const reducido = useSyncExternalStore(suscribirMovimiento, movimientoReducido, () => false);
  const inicioToque = useRef<number | null>(null);
  const total = diapositivas.length;
  const enMovimiento = total > 1 && !pausadoPorUsuario && !enfocado && !reducido;

  const ir = (indice: number) => setActual((indice + total) % total);

  useEffect(() => {
    if (!enMovimiento) return;
    const temporizador = setTimeout(() => setActual((a) => (a + 1) % total), INTERVALO_MS);
    return () => clearTimeout(temporizador);
  }, [actual, enMovimiento, total]);

  if (total === 0) return null;

  return (
    <section
      aria-roledescription="carrusel"
      aria-label="Portada"
      className="group/carrusel relative aspect-[16/9] w-full overflow-hidden bg-arena"
      onMouseEnter={() => setEnfocado(true)}
      onMouseLeave={() => setEnfocado(false)}
      onFocus={() => setEnfocado(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setEnfocado(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") ir(actual - 1);
        if (e.key === "ArrowRight") ir(actual + 1);
      }}
      onPointerDown={(e) => (inicioToque.current = e.clientX)}
      onPointerUp={(e) => {
        if (inicioToque.current === null) return;
        const distancia = e.clientX - inicioToque.current;
        inicioToque.current = null;
        if (Math.abs(distancia) > 50) ir(actual + (distancia < 0 ? 1 : -1));
      }}
    >
      <div aria-live={enMovimiento ? "off" : "polite"} className="absolute inset-0">
        {diapositivas.map((d, i) => {
          const activa = i === actual;
          const contenido = (
            <>
              {/* Fondo difuminado: rellena el espacio si la imagen no es 16:9, sin recortarla */}
              <Image src={d.imagen} alt="" fill sizes="64px" aria-hidden className="scale-110 object-cover opacity-60 blur-2xl" />
              <Image
                src={d.imagen}
                alt={d.alt}
                fill
                preload={i === 0}
                sizes="100vw"
                className={`object-contain transition-transform duration-[7000ms] ease-out ${activa ? "scale-100" : "scale-[1.04]"} ${i === 0 ? "entrada-imagen" : ""}`}
              />
            </>
          );
          return (
            <div
              key={`${d.imagen}-${i}`}
              role="group"
              aria-roledescription="diapositiva"
              aria-label={`${i + 1} de ${total}`}
              aria-hidden={!activa}
              inert={!activa}
              className={`absolute inset-0 transition-opacity duration-[1200ms] ease-calida ${activa ? "opacity-100" : "opacity-0"}`}
            >
              {d.enlace ? (
                <Link href={d.enlace} className="absolute inset-0" draggable={false}>
                  {contenido}
                </Link>
              ) : (
                contenido
              )}
            </div>
          );
        })}
      </div>

      {total > 1 && (
        <>
          {(["anterior", "siguiente"] as const).map((lado) => (
            <button
              key={lado}
              type="button"
              onClick={() => ir(actual + (lado === "siguiente" ? 1 : -1))}
              aria-label={lado === "siguiente" ? "Imagen siguiente" : "Imagen anterior"}
              className={`absolute top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-crema/80 text-xl text-cacao shadow-sm backdrop-blur transition-all duration-500 ease-calida hover:bg-crema sm:opacity-0 sm:group-hover/carrusel:opacity-100 sm:focus-visible:opacity-100 ${lado === "siguiente" ? "right-3 sm:right-5" : "left-3 sm:left-5"}`}
            >
              <span aria-hidden="true">{lado === "siguiente" ? "›" : "‹"}</span>
            </button>
          ))}

          <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setPausadoPorUsuario((p) => !p)}
              aria-label={pausadoPorUsuario ? "Reanudar el carrusel" : "Pausar el carrusel"}
              className="grid size-8 place-items-center rounded-full bg-crema/80 text-xs text-cacao backdrop-blur transition-colors hover:bg-crema"
            >
              <span aria-hidden="true">{pausadoPorUsuario ? "▶" : "❚❚"}</span>
            </button>
            <div className="flex gap-2 rounded-full bg-crema/60 px-3 py-2 backdrop-blur">
              {diapositivas.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => ir(i)}
                  aria-label={`Ir a la imagen ${i + 1}`}
                  aria-current={i === actual}
                  className="h-2 w-2 rounded-full bg-cacao/35 transition-all duration-500 ease-calida hover:bg-cacao/60 aria-[current=true]:w-6 aria-[current=true]:bg-cacao"
                />
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
