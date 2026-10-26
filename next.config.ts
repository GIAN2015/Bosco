import { networkInterfaces } from "node:os";
import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

// Solo en Vercel (HTTPS): en la red local se entra por http://192.168.x.x y rompería los estilos
const httpsEstricto = process.env.VERCEL ? ["upgrade-insecure-requests"] : [];

// Política de seguridad de contenido de la tienda: solo carga recursos propios.
// Next.js necesita 'unsafe-inline' para sus scripts de hidratación en páginas estáticas.
const cspTienda = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...httpsEstricto,
].join("; ");

// El panel (Keystatic en modo GitHub) habla con la API de GitHub, muestra avatares e imágenes
// de GitHub y carga su fuente de Google Fonts.
const cspPanel = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https://*.githubusercontent.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://api.github.com https://*.githubusercontent.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://github.com",
  "frame-ancestors 'none'",
  ...httpsEstricto,
].join("; ");

function ipsDeEstaPc(): string[] {
  return Object.values(networkInterfaces())
    .flat()
    .filter((i) => i && i.family === "IPv4" && !i.internal)
    .map((i) => i!.address);
}

const cabecerasComunes = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

// Se usa la fase y no NODE_ENV: al cargar este archivo en `next dev` NODE_ENV aún no es "development".
export default function configuracion(phase: string): NextConfig {
  // En desarrollo no se envía la CSP: React necesita eval() para depurar y Keystatic carga recursos externos
  const esDesarrollo = phase === PHASE_DEVELOPMENT_SERVER;
  const csp = (valor: string) => (esDesarrollo ? [] : [{ key: "Content-Security-Policy", value: valor }]);
  return {
    poweredByHeader: false,
    // El contenido del CMS se lee del disco con Keystatic: las páginas estáticas lo leen al compilar, pero
    // las dinámicas (/acceso, /keystatic, formularios) lo leen en Vercel, donde hay que incluirlo a mano.
    outputFileTracingIncludes: { "/**": ["./content/**/*"] },
    // Permite usar `npm run dev` (y el CMS, con su login) desde otros equipos de la red de casa:
    // se autorizan las IPs que tenga esta PC, así sigue funcionando aunque cambie la IP.
    // También 127.0.0.1: Next solo autoriza "localhost" por nombre, y sin esto la página carga sin JavaScript.
    allowedDevOrigins: esDesarrollo ? [...ipsDeEstaPc(), "127.0.0.1"] : undefined,
    async headers() {
      return [
        // Toda la web excepto el panel (dos CSP en la misma respuesta se sumarían y bloquearían el panel).
        // /acceso lleva la del panel: tras el login se pasa a /keystatic sin recargar y la CSP es la del documento inicial.
        { source: "/:ruta((?!keystatic|acceso).*)", headers: [...csp(cspTienda), ...cabecerasComunes] },
        ...["/keystatic", "/keystatic/:ruta*", "/acceso"].map((source) => ({
          source,
          headers: [...csp(cspPanel), ...cabecerasComunes],
        })),
      ];
    },
    turbopack: {
      rules: {
        "*.css": {
          loaders: ["@tailwindcss/turbopack"],
          as: "*.css",
        },
      },
    },
  };
}
