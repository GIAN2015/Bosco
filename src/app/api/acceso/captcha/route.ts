import { emitirCaptcha } from "@/lib/captcha";
import { accesoConfigurado } from "@/lib/sesion";

// Imagen del captcha del login del CMS
export async function GET() {
  if (!accesoConfigurado()) return new Response("Not found", { status: 404 });
  const imagen = await emitirCaptcha();
  return new Response(new Uint8Array(imagen), {
    headers: { "Content-Type": "image/png", "Cache-Control": "no-store" },
  });
}
