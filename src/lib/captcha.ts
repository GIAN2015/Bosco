import "server-only";
import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

// Captcha propio (sin servicios externos) para el acceso al CMS.
// El código se dibuja como imagen PNG (un bot no puede leerlo del HTML) y en una cookie solo
// viaja su firma HMAC: caduca a los 5 minutos y sirve una sola vez.

const COOKIE = "bosqo_captcha";
const VIGENCIA_S = 5 * 60;
const LARGO = 5;
// Sin caracteres que se confunden (0/O, 1/I, 5/S, 8/B)
const ALFABETO = "ACDEFGHJKLMNPQRTUVWXY234679";
const usados = new Map<string, number>();

function firmar(codigo: string, expira: number, nonce: string) {
  return createHmac("sha256", process.env.CMS_SECRETO!).update(`captcha:${codigo}:${expira}:${nonce}`).digest("hex");
}

const azar = (min: number, max: number) => min + Math.random() * (max - min);

function svgCaptcha(codigo: string): string {
  const [ancho, alto] = [240, 80];
  const colores = ["#55301f", "#74503d", "#1d3a5f", "#1f4d2e"];
  const ruido = Array.from({ length: 6 }, () => {
    const [x1, y1, x2, y2] = [azar(0, 40), azar(10, 70), azar(200, 240), azar(10, 70)];
    return `<path d="M${x1} ${y1} C ${azar(60, 100)} ${azar(-20, 100)}, ${azar(140, 180)} ${azar(-20, 100)}, ${x2} ${y2}" stroke="${colores[randomInt(colores.length)]}" stroke-width="${azar(1, 2.2)}" fill="none" opacity="0.55"/>`;
  }).join("");
  const puntos = Array.from(
    { length: 70 },
    () => `<circle cx="${azar(0, ancho)}" cy="${azar(0, alto)}" r="${azar(0.6, 1.8)}" fill="#55301f" opacity="${azar(0.2, 0.5)}"/>`,
  ).join("");
  const letras = [...codigo]
    .map((letra, i) => {
      const x = 26 + i * 42 + azar(-5, 5);
      const y = azar(48, 60);
      const fuente = ["Georgia, serif", "Arial, sans-serif", "Verdana, sans-serif", "Times New Roman, serif"][randomInt(4)];
      return `<text x="${x}" y="${y}" font-family="${fuente}" font-size="${azar(34, 44)}" font-weight="bold" fill="${colores[randomInt(colores.length)]}" transform="rotate(${azar(-18, 18)} ${x + 10} ${y - 14}) skewX(${azar(-8, 8)})">${letra}</text>`;
    })
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${ancho}" height="${alto}"><rect width="100%" height="100%" fill="#f6eee4"/>${puntos}${letras}${ruido}</svg>`;
}

// Genera un captcha nuevo: guarda la firma en la cookie y devuelve la imagen PNG
export async function emitirCaptcha(): Promise<Buffer> {
  const codigo = Array.from({ length: LARGO }, () => ALFABETO[randomInt(ALFABETO.length)]).join("");
  const expira = Math.floor(Date.now() / 1000) + VIGENCIA_S;
  const nonce = randomBytes(12).toString("hex");
  (await cookies()).set(COOKIE, `${expira}.${nonce}.${firmar(codigo, expira, nonce)}`, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: VIGENCIA_S,
  });
  const { default: sharp } = await import("sharp");
  return sharp(Buffer.from(svgCaptcha(codigo))).png().toBuffer();
}

// Comprueba la respuesta y consume el captcha (no se puede reutilizar aunque sea correcta)
export async function verificarCaptcha(respuesta: string): Promise<boolean> {
  const almacen = await cookies();
  const [expiraTexto, nonce, firma] = (almacen.get(COOKIE)?.value ?? "").split(".");
  almacen.delete(COOKIE);
  const expira = Number(expiraTexto);
  const ahora = Date.now() / 1000;
  if (!nonce || !firma || !Number.isInteger(expira) || expira < ahora || usados.has(nonce)) return false;
  usados.set(nonce, expira);
  for (const [n, e] of usados) if (e < ahora) usados.delete(n);

  const codigo = respuesta.trim().toUpperCase().slice(0, 20);
  const a = createHash("sha256").update(firma).digest();
  const b = createHash("sha256").update(firmar(codigo, expira, nonce)).digest();
  return timingSafeEqual(a, b);
}
