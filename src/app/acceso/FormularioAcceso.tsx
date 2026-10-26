"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { Campo } from "@/components/formularios/Formulario";
import type { EstadoFormulario } from "@/lib/acciones";
import { entrar } from "./acciones";

const INICIAL: EstadoFormulario = { estado: "inicial", mensaje: "" };

export function FormularioAcceso() {
  const [estado, enviar, enviando] = useActionState(entrar, INICIAL);
  const [version, setVersion] = useState(0);
  const captcha = useRef<HTMLInputElement>(null);
  // Cada intento consume el captcha: tras un error (nuevo `intento`) se pide otra imagen
  const imagen = `${version}-${estado.intento ?? ""}`;

  useEffect(() => {
    if (estado.estado === "error" && captcha.current) captcha.current.value = "";
  }, [estado]);

  return (
    <form
      className="space-y-4"
      // `action` + POST: si el JavaScript no carga, el navegador envía igualmente por POST a la Server Action
      // y los datos nunca acaban en la URL. Con JavaScript, onSubmit se encarga del envío.
      action={enviar}
      method="post"
      onSubmit={(e) => {
        e.preventDefault();
        const datos = new FormData(e.currentTarget);
        startTransition(() => enviar(datos));
      }}
    >
      <Campo etiqueta="Usuario" nombre="usuario" autoComplete="username" maxLength={100} autoFocus />
      <Campo etiqueta="Contraseña" nombre="clave" tipo="password" autoComplete="current-password" maxLength={200} />

      <div>
        <label htmlFor="campo-captcha" className="etiqueta-campo">
          Código de la imagen <span aria-hidden="true">*</span>
        </label>
        <div className="mb-2 flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element -- imagen dinámica del servidor, no se optimiza */}
          <img
            key={imagen}
            src={`/api/acceso/captcha?v=${imagen}`}
            alt="Código de verificación: escribe los 5 caracteres de la imagen"
            width={240}
            height={80}
            className="h-16 w-auto flex-1 border border-linea object-contain"
          />
          <button
            type="button"
            onClick={() => setVersion((v) => v + 1)}
            className="grid size-11 shrink-0 place-items-center border border-linea text-lg transition-colors duration-300 hover:border-cacao"
            aria-label="Mostrar otro código"
            title="Otro código"
          >
            ↻
          </button>
        </div>
        <input
          ref={captcha}
          id="campo-captcha"
          name="captcha"
          required
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={10}
          className="campo uppercase tracking-[0.3em]"
        />
      </div>

      {estado.estado === "error" && (
        <p role="alert" className="aparece border border-error/30 bg-error/5 p-3 text-sm text-error">
          {estado.mensaje}
        </p>
      )}

      <button type="submit" className="boton w-full" disabled={enviando}>
        {enviando ? "Verificando…" : "Entrar"}
      </button>
    </form>
  );
}
