// Genera (o cambia) el usuario y la contraseña del panel del CMS.
// Uso: node scripts/crear-acceso.mjs
// Escribe CMS_USUARIO, CMS_CLAVE_HASH y CMS_SECRETO en .env.local (no se sube a git)
// y muestra la contraseña UNA sola vez: guárdala en un gestor de contraseñas.
import { randomBytes, randomInt, scryptSync } from "node:crypto";
import fs from "node:fs";

// Sin caracteres que se confunden (0/O, 1/l/I) ni símbolos problemáticos en .env
const LETRAS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
const SIMBOLOS = "!#%*+-=?@^_~";
const aleatorio = (alfabeto, n) => Array.from({ length: n }, () => alfabeto[randomInt(alfabeto.length)]).join("");

function generarClave(largo = 24) {
  const todos = LETRAS + SIMBOLOS;
  while (true) {
    const clave = aleatorio(todos, largo);
    // Exige mayúsculas, minúsculas, números y símbolos
    if (/[A-Z]/.test(clave) && /[a-z]/.test(clave) && /\d/.test(clave) && /[!#%*+\-=?@^_~]/.test(clave)) return clave;
  }
}

const usuario = `bosqo_${aleatorio("abcdefghijkmnpqrstuvwxyz23456789", 8)}`;
const clave = generarClave();
const sal = randomBytes(16);
const hash = scryptSync(clave, sal, 64);

const valores = {
  CMS_USUARIO: usuario,
  // Separador ":" y no "$": Next.js expande las variables con $ al leer los .env
  CMS_CLAVE_HASH: `scrypt:${sal.toString("hex")}:${hash.toString("hex")}`,
  CMS_SECRETO: randomBytes(32).toString("hex"),
};

const archivo = ".env.local";
let contenido = fs.existsSync(archivo) ? fs.readFileSync(archivo, "utf8") : "";
for (const [clave, valor] of Object.entries(valores)) {
  const linea = `${clave}=${valor}`;
  const patron = new RegExp(`^${clave}=.*$`, "m");
  contenido = patron.test(contenido) ? contenido.replace(patron, () => linea) : `${contenido.trimEnd()}\n${linea}\n`.trimStart();
}
fs.writeFileSync(archivo, contenido);

console.log("Acceso al CMS actualizado en .env.local\n");
console.log(`  Usuario:    ${usuario}`);
console.log(`  Contraseña: ${clave}\n`);
console.log("Guárdala ahora: no se puede recuperar (solo se guarda cifrada).");
console.log("Reinicia `npm run dev` y entra en http://localhost:3000/acceso");
