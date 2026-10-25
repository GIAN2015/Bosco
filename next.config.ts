import { networkInterfaces } from "node:os";
import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

// Política de seguridad de contenido: la web solo carga recursos propios.
// Next.js necesita 'unsafe-inline' para sus scripts de hidratación en páginas estáticas.
const csp = [
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
  // Solo en Vercel (HTTPS): en la red local se entra por http://192.168.x.x y rompería los estilos
  ...(process.env.VERCEL ? ["upgrade-insecure-requests"] : []),
].join("; ");

function ipsDeEstaPc(): string[] {
  return Object.values(networkInterfaces())
    .flat()
    .filter((i) => i && i.family === "IPv4" && !i.internal)
    .map((i) => i!.address);
}

// Se usa la fase y no NODE_ENV: al cargar este archivo en `next dev` NODE_ENV aún no es "development".
export default function configuracion(phase: string): NextConfig {
  // En desarrollo no se envía la CSP: React necesita eval() para depurar y Keystatic carga recursos externos
  const esDesarrollo = phase === PHASE_DEVELOPMENT_SERVER;
  return {
    poweredByHeader: false,
    // Permite usar `npm run dev` (y el CMS, con su login) desde otros equipos de la red de casa:
    // se autorizan las IPs que tenga esta PC, así sigue funcionando aunque cambie la IP.
    allowedDevOrigins: esDesarrollo ? ipsDeEstaPc() : undefined,
    async headers() {
      return [
        {
          source: "/:path*",
          headers: [
            ...(esDesarrollo ? [] : [{ key: "Content-Security-Policy", value: csp }]),
            { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
            { key: "X-Content-Type-Options", value: "nosniff" },
            { key: "X-Frame-Options", value: "DENY" },
            { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
            { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
          ],
        },
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
