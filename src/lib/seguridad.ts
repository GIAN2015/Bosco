import "server-only";
import { headers } from "next/headers";

// Protección anti-spam para los formularios:
// 1. Campo trampa (honeypot) invisible que solo rellenan los bots.
// 2. Tiempo mínimo entre que se carga el formulario y se envía.
// 3. Límite de envíos por IP (en memoria: es por instancia, frena abusos básicos).

export const CAMPO_TRAMPA = "empresa_web";
export const CAMPO_TIEMPO = "_inicio";

const VENTANA_MS = 10 * 60 * 1000;
const MAX_ENVIOS = 5;
const envios = new Map<string, number[]>();

function superaLimite(clave: string): boolean {
  const ahora = Date.now();
  const recientes = (envios.get(clave) ?? []).filter((t) => ahora - t < VENTANA_MS);
  recientes.push(ahora);
  envios.set(clave, recientes);
  if (envios.size > 5000) {
    for (const [k, v] of envios) if (v.every((t) => ahora - t >= VENTANA_MS)) envios.delete(k);
  }
  return recientes.length > MAX_ENVIOS;
}

export type Verificacion = { ok: true } | { ok: false; silencioso: boolean; mensaje: string };

export async function verificarEnvio(formData: FormData, formulario: string): Promise<Verificacion> {
  // A un bot se le responde "éxito" para no darle pistas
  if (String(formData.get(CAMPO_TRAMPA) ?? "") !== "") {
    return { ok: false, silencioso: true, mensaje: "" };
  }
  const inicio = Number(formData.get(CAMPO_TIEMPO));
  if (!Number.isFinite(inicio) || Date.now() - inicio < 2500) {
    return { ok: false, silencioso: true, mensaje: "" };
  }
  if (superaLimite(`${formulario}:${await ipCliente()}`)) {
    return { ok: false, silencioso: false, mensaje: "Demasiados envíos seguidos. Inténtalo de nuevo en unos minutos." };
  }
  return { ok: true };
}

export async function ipCliente(): Promise<string> {
  const h = await headers();
  return h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "desconocida";
}

// Intentos fallidos de inicio de sesión: solo cuentan los fallos y un acceso correcto los reinicia
const VENTANA_FALLOS_MS = 15 * 60 * 1000;
const MAX_FALLOS = 5;
const fallos = new Map<string, number[]>();

const fallosRecientes = (clave: string) => (fallos.get(clave) ?? []).filter((t) => Date.now() - t < VENTANA_FALLOS_MS);

export function demasiadosFallos(clave: string): boolean {
  return fallosRecientes(clave).length >= MAX_FALLOS;
}

export function registrarFallo(clave: string) {
  fallos.set(clave, [...fallosRecientes(clave), Date.now()]);
}

export function limpiarFallos(clave: string) {
  fallos.delete(clave);
}
