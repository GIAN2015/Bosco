import "server-only";
import { createHash, createHmac, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";

// Acceso al panel del CMS. Credenciales en .env.local (las genera scripts/crear-acceso.mjs):
//   CMS_USUARIO      usuario
//   CMS_CLAVE_HASH   contraseña cifrada con scrypt: "scrypt:<sal>:<hash>" (la contraseña nunca se guarda)
//   CMS_SECRETO      clave para firmar la cookie de sesión

const COOKIE = "bosqo_cms";
const DURACION_S = 8 * 60 * 60;
const scryptAsync = promisify(scrypt) as (clave: string, sal: Buffer, largo: number) => Promise<Buffer>;

export function accesoConfigurado(): boolean {
  return Boolean(process.env.CMS_USUARIO && process.env.CMS_CLAVE_HASH && process.env.CMS_SECRETO);
}

// Compara en tiempo constante (no revela cuántos caracteres coinciden)
function iguales(a: string | Buffer, b: string | Buffer): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export async function credencialesValidas(usuario: string, clave: string): Promise<boolean> {
  if (!accesoConfigurado()) return false;
  const [algoritmo, sal, hash] = process.env.CMS_CLAVE_HASH!.split(":");
  if (algoritmo !== "scrypt" || !sal || !hash) return false;
  const calculado = await scryptAsync(clave, Buffer.from(sal, "hex"), 64);
  // Se evalúan ambas comparaciones siempre para no revelar si falló el usuario o la contraseña
  const usuarioOk = iguales(usuario, process.env.CMS_USUARIO!);
  const claveOk = iguales(calculado, Buffer.from(hash, "hex"));
  return usuarioOk && claveOk;
}

function firmar(expira: number): string {
  return createHmac("sha256", process.env.CMS_SECRETO!).update(`cms:${process.env.CMS_USUARIO}:${expira}`).digest("hex");
}

export async function iniciarSesion() {
  const expira = Math.floor(Date.now() / 1000) + DURACION_S;
  (await cookies()).set(COOKIE, `${expira}.${firmar(expira)}`, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DURACION_S,
  });
}

export async function cerrarSesionActual() {
  (await cookies()).delete(COOKIE);
}

export async function sesionValida(): Promise<boolean> {
  if (!accesoConfigurado()) return false;
  const valor = (await cookies()).get(COOKIE)?.value ?? "";
  const [expiraTexto, firma] = valor.split(".");
  const expira = Number(expiraTexto);
  if (!firma || !Number.isInteger(expira) || expira < Date.now() / 1000) return false;
  return iguales(firma, firmar(expira));
}
