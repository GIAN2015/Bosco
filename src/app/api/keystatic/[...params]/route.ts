import { makeRouteHandler } from "@keystatic/next/route-handler";
import { sesionValida } from "@/lib/sesion";
import config from "../../../../../keystatic.config";

const handler = makeRouteHandler({ config });

// La API del CMS escribe archivos en disco: solo existe en local y solo con sesión iniciada
const soloLocal = process.env.NODE_ENV !== "production";

async function protegido(request: Request, metodo: (r: Request) => Promise<Response>) {
  if (!soloLocal) return new Response("Not found", { status: 404 });
  if (!(await sesionValida())) return new Response("No autorizado", { status: 401 });
  return metodo(request);
}

export const GET = (request: Request) => protegido(request, handler.GET);
export const POST = (request: Request) => protegido(request, handler.POST);
