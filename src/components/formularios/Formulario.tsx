"use client";

import { startTransition, useActionState, useEffect, useRef } from "react";
import type { EstadoFormulario } from "@/lib/acciones";

type Accion = (estado: EstadoFormulario, formData: FormData) => Promise<EstadoFormulario>;

const INICIAL: EstadoFormulario = { estado: "inicial", mensaje: "" };

// Envoltorio común: anti-spam (campo trampa + tiempo), estado de envío y mensajes.
// Los nombres de los campos ocultos deben coincidir con CAMPO_TRAMPA y CAMPO_TIEMPO de lib/seguridad.
export function Formulario({
  accion,
  children,
  textoBoton,
  className = "space-y-4",
  ocultarAlEnviar = false,
}: {
  accion: Accion;
  children: React.ReactNode;
  textoBoton: string;
  className?: string;
  ocultarAlEnviar?: boolean;
}) {
  const [estado, enviar, enviando] = useActionState(accion, INICIAL);
  const formulario = useRef<HTMLFormElement>(null);
  const inicio = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inicio.current) inicio.current.value = String(Date.now());
  }, []);

  useEffect(() => {
    if (estado.estado === "ok") formulario.current?.reset();
    if (inicio.current) inicio.current.value = String(Date.now());
  }, [estado]);

  if (ocultarAlEnviar && estado.estado === "ok") {
    return (
      <p role="status" className="aparece border border-exito/30 bg-exito/5 p-4 text-sm text-exito">
        {estado.mensaje}
      </p>
    );
  }

  return (
    <form
      ref={formulario}
      className={className}
      // Sin JavaScript el navegador envía por POST a la Server Action: los datos nunca van en la URL
      action={enviar}
      method="post"
      onSubmit={(e) => {
        // Envío manual para que React no borre los campos si hay un error
        e.preventDefault();
        const datos = new FormData(e.currentTarget);
        startTransition(() => enviar(datos));
      }}
    >
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          No completar
          <input type="text" name="empresa_web" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
      <input ref={inicio} type="hidden" name="_inicio" defaultValue="" />

      {children}

      {estado.estado !== "inicial" && (
        <p
          role={estado.estado === "error" ? "alert" : "status"}
          className={`aparece border p-3 text-sm ${
            estado.estado === "ok" ? "border-exito/30 bg-exito/5 text-exito" : "border-error/30 bg-error/5 text-error"
          }`}
        >
          {estado.mensaje}
        </p>
      )}

      <button type="submit" className="boton w-full sm:w-auto" disabled={enviando}>
        {enviando ? "Enviando…" : textoBoton}
      </button>
    </form>
  );
}

export function Campo({
  etiqueta,
  nombre,
  tipo = "text",
  requerido = true,
  multilinea = false,
  ...props
}: {
  etiqueta: string;
  nombre: string;
  tipo?: string;
  requerido?: boolean;
  multilinea?: boolean;
} & Omit<React.InputHTMLAttributes<HTMLInputElement> & React.TextareaHTMLAttributes<HTMLTextAreaElement>, "name" | "type">) {
  const id = `campo-${nombre}`;
  return (
    <div>
      <label htmlFor={id} className="etiqueta-campo">
        {etiqueta}
        {requerido && <span aria-hidden="true"> *</span>}
      </label>
      {multilinea ? (
        <textarea id={id} name={nombre} required={requerido} rows={5} className="campo" {...props} />
      ) : (
        <input id={id} name={nombre} type={tipo} required={requerido} className="campo" {...props} />
      )}
    </div>
  );
}
