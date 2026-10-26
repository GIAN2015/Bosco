import { makeRouteHandler } from "@keystatic/next/route-handler";
import { sesionValida } from "@/lib/sesion";
import config from "../../../../../keystatic.config";

// En modo GitHub, Keystatic lanza un error al crear el manejador si faltan sus variables
// (KEYSTATIC_GITHUB_CLIENT_ID…): se crea al primer uso para que el build no falle sin ellas.
let manejador: ReturnType<typeof makeRouteHandler> | undefined;

async function protegido(request: Request, metodo: "GET" | "POST") {
  // La API del CMS guarda contenido: siempre exige haber pasado por /acceso
  if (!(await sesionValida())) return new Response("No autorizado", { status: 401 });
  try {
    manejador ??= makeRouteHandler({ config });
  } catch (error) {
    console.error(error);
    return new Response("El CMS en modo GitHub no está configurado (faltan variables KEYSTATIC_*).", { status: 503 });
  }
  return manejador[metodo](request);
}

export const GET = (request: Request) => protegido(request, "GET");
export const POST = (request: Request) => protegido(request, "POST");
