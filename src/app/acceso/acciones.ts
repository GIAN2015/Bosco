"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import type { EstadoFormulario } from "@/lib/acciones";
import { verificarCaptcha } from "@/lib/captcha";
import { demasiadosFallos, ipCliente, limpiarFallos, registrarFallo } from "@/lib/seguridad";
import { cerrarSesionActual, credencialesValidas, iniciarSesion } from "@/lib/sesion";

const ERROR = "Usuario o contraseña incorrectos.";

// Pausa ante cualquier fallo para encarecer los intentos por fuerza bruta
const fallo = async (clave: string, mensaje: string): Promise<EstadoFormulario> => {
  registrarFallo(clave);
  await new Promise((r) => setTimeout(r, 800));
  return { estado: "error", mensaje, intento: randomUUID() };
};

export async function entrar(_: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const clave = `acceso:${await ipCliente()}`;
  if (demasiadosFallos(clave)) {
    return { estado: "error", mensaje: "Demasiados intentos fallidos. Espera 15 minutos e inténtalo de nuevo." };
  }

  // El captcha se valida (y se consume) antes de mirar la contraseña
  if (!(await verificarCaptcha(String(formData.get("captcha") ?? "")))) {
    return fallo(clave, "El código de la imagen no es correcto o caducó. Prueba con el nuevo.");
  }
  const usuario = String(formData.get("usuario") ?? "").slice(0, 100);
  const contrasena = String(formData.get("clave") ?? "").slice(0, 200);
  if (!(await credencialesValidas(usuario, contrasena))) return fallo(clave, ERROR);

  limpiarFallos(clave);
  await iniciarSesion();
  redirect("/keystatic");
}

export async function salir() {
  await cerrarSesionActual();
  redirect("/acceso");
}
