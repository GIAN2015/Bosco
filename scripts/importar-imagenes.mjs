// Importa las fotos originales (carpeta BOSCO) a public/ optimizadas en WebP.
// Uso: node scripts/importar-imagenes.mjs [carpeta-origen] [--solo-marca]   (por defecto "..")
// Solo hace falta para la carga inicial: después las imágenes se gestionan desde el CMS (/keystatic).
// --solo-marca regenera logos e íconos sin tocar las fotos de productos.
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const argumentos = process.argv.slice(2);
const soloMarca = argumentos.includes("--solo-marca");
const origen = path.resolve(argumentos.find((a) => !a.startsWith("--")) ?? "..");
const publico = path.resolve("public/images");
const polos = path.join(origen, "POLOS CON FONDO BEIDGE");

// slug del producto -> carpeta de origen y orden de las fotos (índices según orden alfabético)
const productos = {
  "polo-oversize-essential-negro": ["Hombres/negro", [2, 4, 1, 3, 0, 5]],
  "polo-oversize-essential-hueso": ["Hombres/Hueso premium", [3, 5, 1, 2, 4, 0, 6]],
  "polo-oversize-costa": ["Hombres/Costa", [2, 1, 4, 3, 0, 5]],
  "polo-oversize-andes": ["Hombres/Andes", [1, 0, 2, 3, 4, 5]],
  "polo-oversize-selva": ["Hombres/Selva", [1, 0, 4, 2, 3, 5]],
  "croptop-oversize-essential-negro": ["Mujeres/Polos negros", [0, 1, 4, 3, 2, 5]],
  "croptop-oversize-essential-blanco": ["Mujeres/Polos blancos", [1, 2, 5, 4, 3, 0, 6]],
  "croptop-costa": ["Mujeres/costa", [1, 0, 2, 3, 4, 5]],
  "croptop-andes": ["Mujeres/andes", [1, 0, 2, 3, 4, 5]],
  "croptop-selva": ["Mujeres/selva", [1, 0, 2, 3, 4, 5]],
};

const listar = (dir) =>
  fs.readdirSync(dir).filter((f) => /\.(png|jpe?g)$/i.test(f)).sort();

async function aWebp(entrada, salida, ancho, calidad = 80) {
  fs.mkdirSync(path.dirname(salida), { recursive: true });
  await sharp(entrada)
    .rotate()
    .resize({ width: ancho, height: ancho, fit: "inside", withoutEnlargement: true })
    .webp({ quality: calidad })
    .toFile(salida);
}

// Convierte un logo de un solo color sobre fondo liso en PNG transparente del color indicado.
async function logoTransparente(entrada, salida, colorHex, anchoMax) {
  const base = sharp(entrada).flatten({ background: "#ffffff" }).trim({ threshold: 20 });
  const { data, info } = await base
    .clone()
    .resize({ width: anchoMax, withoutEnlargement: true })
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const fondo = data[0];
  let tinta = 255;
  for (const v of data) if (v < tinta) tinta = v;
  const alfa = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i++) {
    const a = ((fondo - data[i]) / (fondo - tinta)) * 255;
    alfa[i] = Math.max(0, Math.min(255, Math.round(a)));
  }
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(colorHex.slice(i, i + 2), 16));
  fs.mkdirSync(path.dirname(salida), { recursive: true });
  await sharp({ create: { width: info.width, height: info.height, channels: 3, background: { r, g, b } } })
    .joinChannel(alfa, { raw: { width: info.width, height: info.height, channels: 1 } })
    .png()
    .toFile(salida);
}

// Quita el fondo blanco de un logo a color conservando sus colores y bordes suaves ("color a alfa").
async function quitarFondoBlanco(entrada) {
  const { data, info } = await sharp(entrada).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const FONDO = 248; // el blanco del JPEG no es puro
  for (let i = 0; i < data.length; i += 4) {
    let alfa = 0;
    for (let c = 0; c < 3; c++) alfa = Math.max(alfa, (FONDO - data[i + c]) / FONDO);
    alfa = Math.min(1, Math.max(0, alfa));
    if (alfa < 0.03) {
      data[i + 3] = 0;
      continue;
    }
    for (let c = 0; c < 3; c++) {
      data[i + c] = Math.max(0, Math.min(255, Math.round((data[i + c] - (1 - alfa) * FONDO) / alfa)));
    }
    data[i + 3] = Math.round(alfa * 255);
  }
  return sharp(data, { raw: info });
}

for (const [slug, [carpeta, orden]] of Object.entries(productos)) {
  if (soloMarca) break;
  const dir = path.join(polos, carpeta);
  const archivos = listar(dir);
  // Mismos nombres que usa Keystatic (<slug>/imagenes/0.webp…): así al guardar en el CMS no los renombra
  for (const [n, i] of orden.entries()) {
    await aWebp(path.join(dir, archivos[i]), path.join(publico, "productos", slug, "imagenes", `${n}.webp`), 1400);
  }
  console.log(`✓ ${slug}: ${orden.length} fotos`);
}

const logos = path.join(origen, "Logos");
const CACAO = "#55301f";
const CREMA = "#f6eee4";
await aWebp(path.join(logos, "portada.png"), path.join(publico, "marca", "heroImagen.webp"), 2000, 82);
await logoTransparente(path.join(logos, "BOSQO_Logo_Cacao.png"), path.join(publico, "marca", "wordmark.png"), CACAO, 900);
await logoTransparente(path.join(logos, "BOSQO_Logo_Cacao.png"), path.join(publico, "marca", "wordmark-crema.png"), CREMA, 900);
await logoTransparente(path.join(logos, "Logotipo BOSQO sobre fondo transparente.png"), path.join(publico, "marca", "logotipo.png"), CACAO, 1000);
await logoTransparente(path.join(logos, "ISOTIPO.png"), path.join(publico, "marca", "isotipo.png"), CACAO, 400);
await logoTransparente(path.join(logos, "ISOTIPO.png"), path.join(publico, "marca", "isotipo-crema.png"), CREMA, 400);
await aWebp(path.join(origen, "guia de tallas", "Guía visual para medir tus polos.png"), path.join(publico, "guia-de-tallas.webp"), 1600, 85);

// Íconos de la web (favicon y Apple) a partir del isotipo
const isotipo = path.join(logos, "ISOTIPO.png");
await sharp(isotipo).resize(512, 512).png().toFile(path.resolve("src/app/icon.png"));
await sharp(isotipo).resize(180, 180).png().toFile(path.resolve("src/app/apple-icon.png"));

// Logos de las regiones de ORIGEN: la imagen trae Selva, Costa y Andes lado a lado
const regiones = path.join(polos, "Hombres", listar(path.join(polos, "Hombres"))[0]);
const { width: anchoReg, height: altoReg } = await sharp(regiones).metadata();
for (const [i, region] of ["selva", "costa", "andes"].entries()) {
  const tercio = Math.floor(anchoReg / 3);
  // sharp aplica trim antes que extract en un mismo pipeline: se recorta en dos pasos
  const recorte = await sharp(regiones)
    .extract({ left: i * tercio, top: 0, width: tercio, height: altoReg })
    .toBuffer();
  const recortado = await sharp(recorte)
    .trim({ threshold: 25 })
    .resize({ width: 500, withoutEnlargement: true })
    .png()
    .toBuffer();
  await (await quitarFondoBlanco(recortado))
    .webp({ quality: 90, alphaQuality: 100 })
    .toFile(path.join(publico, "marca", `origen-${region}.webp`));
}
console.log("✓ marca, guía de tallas, íconos y regiones");
