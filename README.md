# BOSQO · Tienda web

Next.js 16 + Tailwind CSS 4 + Keystatic (CMS). Todas las páginas se generan como HTML estático en el build;
solo los formularios usan funciones serverless de Vercel. No necesita VPS ni base de datos.

## Editar el contenido (CMS)

En el panel puedes cambiar productos, fotos, tallas agotadas, precios y promociones, el carrusel de la
portada, WhatsApp, redes y páginas legales.

| Dónde | Cómo guarda |
|---|---|
| **Web publicada:** `https://<tu-dominio>/acceso` | Directamente en GitHub (cada *Save* es un commit) → Vercel publica solo en 1-2 min |
| **Tu PC:** `npm run dev` → `http://localhost:3000/acceso` | En los archivos de `content/` y `public/images/` → luego `git add -A`, `git commit` y `git push` |

> Si editas en la web publicada y luego en tu PC, haz antes `git pull` para traer los cambios.

### Configurar el CMS en la web publicada (una sola vez)

1. En tu PC: `$env:NEXT_PUBLIC_CMS_GITHUB="1"; npm run dev` (PowerShell) y entra en `/acceso` → `/keystatic`.
2. Keystatic muestra un asistente: crea la GitHub App, instálala en el repositorio y escribe sus
   credenciales en el archivo `.env` (no se sube a git).
3. En la GitHub App (github.com/settings/apps) añade la Callback URL
   `https://<tu-dominio>/api/keystatic/github/oauth/callback`.
4. Copia a Vercel las variables `KEYSTATIC_*` y `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` del `.env`, y las
   `CMS_*` del `.env.local`. Luego haz *Redeploy*.

| Comando | Puerto | Para qué |
|---|---|---|
| `npm run dev` | 3000 | Editar con el CMS: los cambios se ven al instante (también desde la red: `http://<tu-ip>:3000`) |
| `npm run red-local` | 4000 | Enseñar la versión final en tu red. Es una **copia fija**: tras editar, vuelve a ejecutarlo |

### Acceso al panel

El panel pide usuario y contraseña en `/acceso` (la sesión dura 8 horas; para salir, vuelve a `/acceso`).
En la web publicada, además, Keystatic pide entrar con una cuenta de GitHub con permiso sobre el repositorio.
Las credenciales están en `.env.local`, que **no** se sube a git: la contraseña solo se guarda cifrada (scrypt).

- **Cambiar usuario y contraseña** (o si la olvidaste): `node scripts/crear-acceso.mjs`, reinicia `npm run dev`
  y copia las nuevas `CMS_*` a Vercel (con *Redeploy*).
- Captcha propio (imagen generada en el servidor, sin servicios externos): caduca a los 5 minutos y vale
  para un solo intento. Si no se lee bien, el botón ↻ muestra otro.
- Tras 5 intentos fallidos la IP queda bloqueada 15 minutos (un acceso correcto reinicia el contador).
  Sin `.env.local` configurado, el panel queda bloqueado.

## Cómo funciona la compra

No es un e-commerce: no hay carrito ni pagos en la web.

1. En la página del producto el cliente elige talla y cantidad (ve el total con la promo de 2 y 3 unidades).
2. "Pedir por WhatsApp" abre un chat con el producto, la talla, la cantidad y el enlace del polo.
3. Confirmas stock y envío y cobras por Yape o Plin.

El precio tachado sale del campo "Precio regular" de cada línea de precio en el CMS.

## Formularios

Contacto, newsletter, "avísame" (tallas agotadas) y libro de reclamaciones envían un correo desde una cuenta
de Gmail con [contraseña de aplicación](https://myaccount.google.com/apppasswords) (requiere la verificación en
2 pasos). Configura `GMAIL_USUARIO`, `GMAIL_CLAVE_APP` y `CORREO_DESTINO` en Vercel
(Project → Settings → Environment Variables). En local, sin configurar, los mensajes se muestran en la terminal.

Seguridad: validación en el servidor (zod), campo trampa anti-bots, tiempo mínimo de llenado, límite de
envíos por IP, correos solo en texto plano y protección CSRF de Next.js. Cabeceras de seguridad (CSP, HSTS,
X-Frame-Options, etc.) en `next.config.ts`.

## Estructura

```
content/                 contenido editable (lo escribe el CMS)
public/images/           fotos optimizadas (WebP)
keystatic.config.ts      campos del CMS
src/app/(tienda)/        páginas de la tienda
src/lib/                 catálogo, precios, formularios, correo y anti-spam
scripts/importar-imagenes.mjs   carga inicial de fotos desde la carpeta original
```
