// Completa APIs del navegador que solo existen en HTTPS o en localhost, para poder usar el panel
// desde otro equipo de la red (http://192.168.x.x). En localhost y en HTTPS no se toca nada.
//  - crypto.subtle.digest (SHA-1 y SHA-256): Keystatic calcula huellas de archivos y Next.js de rutas.
//  - navigator.clipboard: botones de copiar/pegar entradas de Keystatic.

function relleno(mensaje: Uint8Array): DataView {
  const largo = mensaje.length;
  const total = ((largo + 9 + 63) >> 6) << 6;
  const bloque = new Uint8Array(total);
  bloque.set(mensaje);
  bloque[largo] = 0x80;
  const vista = new DataView(bloque.buffer);
  const bits = largo * 8;
  vista.setUint32(total - 8, Math.floor(bits / 2 ** 32));
  vista.setUint32(total - 4, bits >>> 0);
  return vista;
}

const resultado = (palabras: number[]) => {
  const salida = new DataView(new ArrayBuffer(palabras.length * 4));
  palabras.forEach((h, i) => salida.setUint32(i * 4, h));
  return salida.buffer;
};

const rotarIzq = (x: number, n: number) => (x << n) | (x >>> (32 - n));
const rotarDer = (x: number, n: number) => (x >>> n) | (x << (32 - n));

export function sha1(mensaje: Uint8Array): ArrayBuffer {
  const vista = relleno(mensaje);
  const h = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0];
  const w = new Uint32Array(80);
  for (let o = 0; o < vista.byteLength; o += 64) {
    for (let i = 0; i < 16; i++) w[i] = vista.getUint32(o + i * 4);
    for (let i = 16; i < 80; i++) w[i] = rotarIzq(w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16], 1);
    let [a, b, c, d, e] = h;
    for (let i = 0; i < 80; i++) {
      const [f, k] =
        i < 20 ? [(b & c) | (~b & d), 0x5a827999]
        : i < 40 ? [b ^ c ^ d, 0x6ed9eba1]
        : i < 60 ? [(b & c) | (b & d) | (c & d), 0x8f1bbcdc]
        : [b ^ c ^ d, 0xca62c1d6];
      const t = (rotarIzq(a, 5) + f + e + k + w[i]) >>> 0;
      [e, d, c, b, a] = [d, c, rotarIzq(b, 30) >>> 0, a, t];
    }
    [a, b, c, d, e].forEach((v, i) => (h[i] = (h[i] + v) >>> 0));
  }
  return resultado(h);
}

const K256 = Array.from({ length: 64 }, (_, i) => {
  // Primeros 32 bits de la parte fraccionaria de la raíz cúbica de los primeros 64 primos
  const primos: number[] = [];
  for (let n = 2; primos.length < 64; n++) if (primos.every((p) => n % p !== 0)) primos.push(n);
  return Math.floor((Math.cbrt(primos[i]) % 1) * 2 ** 32) >>> 0;
});

export function sha256(mensaje: Uint8Array): ArrayBuffer {
  const vista = relleno(mensaje);
  const h = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  const w = new Uint32Array(64);
  for (let o = 0; o < vista.byteLength; o += 64) {
    for (let i = 0; i < 16; i++) w[i] = vista.getUint32(o + i * 4);
    for (let i = 16; i < 64; i++) {
      const s0 = rotarDer(w[i - 15], 7) ^ rotarDer(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotarDer(w[i - 2], 17) ^ rotarDer(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }
    let [a, b, c, d, e, f, g, hh] = h;
    for (let i = 0; i < 64; i++) {
      const t1 = (hh + (rotarDer(e, 6) ^ rotarDer(e, 11) ^ rotarDer(e, 25)) + ((e & f) ^ (~e & g)) + K256[i] + w[i]) >>> 0;
      const t2 = ((rotarDer(a, 2) ^ rotarDer(a, 13) ^ rotarDer(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) >>> 0;
      [hh, g, f, e, d, c, b, a] = [g, f, e, (d + t1) >>> 0, c, b, a, (t1 + t2) >>> 0];
    }
    [a, b, c, d, e, f, g, hh].forEach((v, i) => (h[i] = (h[i] + v) >>> 0));
  }
  return resultado(h);
}

const aBytes = (datos: BufferSource) =>
  ArrayBuffer.isView(datos) ? new Uint8Array(datos.buffer, datos.byteOffset, datos.byteLength) : new Uint8Array(datos);

// Copia texto con el método clásico (funciona sin HTTPS)
function copiarTexto(texto: string) {
  const area = document.createElement("textarea");
  area.value = texto;
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.append(area);
  area.select();
  document.execCommand("copy");
  area.remove();
}

export function completarApisRedLocal() {
  if (typeof window === "undefined" || window.isSecureContext) return;

  if (!window.crypto.subtle) {
    const algoritmos: Record<string, (m: Uint8Array) => ArrayBuffer> = { "SHA-1": sha1, "SHA-256": sha256 };
    Object.defineProperty(window.crypto, "subtle", {
      configurable: true,
      value: {
        async digest(algoritmo: AlgorithmIdentifier, datos: BufferSource) {
          const nombre = (typeof algoritmo === "string" ? algoritmo : algoritmo.name).toUpperCase();
          const calcular = algoritmos[nombre];
          if (!calcular) throw new Error(`${nombre} no disponible fuera de HTTPS`);
          return calcular(aBytes(datos));
        },
      },
    });
  }

  if (!navigator.clipboard) {
    const sinPegar = () => Promise.reject(new Error("Pegar solo funciona en localhost o HTTPS"));
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (texto: string) => copiarTexto(texto),
        write: async (items: ClipboardItem[]) => {
          const item = items.find((i) => i.types.includes("text/plain"));
          if (item) copiarTexto(await (await item.getType("text/plain")).text());
        },
        readText: sinPegar,
        read: sinPegar,
      },
    });
  }
}
