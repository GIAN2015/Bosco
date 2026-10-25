// URL pública del sitio: NEXT_PUBLIC_SITE_URL (tu dominio) o, en Vercel, el dominio de producción.
export const URL_SITIO = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/$/, "");
