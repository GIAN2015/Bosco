// Keystatic calcula SHA-1 con crypto.subtle, que el navegador solo ofrece en HTTPS o en localhost.
// Al abrir el panel desde otro equipo de la red (http://192.168.x.x) no existe y el panel falla al
// guardar: aquí se completa con SHA-1 en JavaScript. En localhost y en HTTPS no se toca nada.

export function sha1(mensaje: Uint8Array): ArrayBuffer {
  const largo = mensaje.length;
  const total = ((largo + 9 + 63) >> 6) << 6;
  const bloque = new Uint8Array(total);
  bloque.set(mensaje);
  bloque[largo] = 0x80;
  const vista = new DataView(bloque.buffer);
  const bits = largo * 8;
  vista.setUint32(total - 8, Math.floor(bits / 2 ** 32));
  vista.setUint32(total - 4, bits >>> 0);

  let [h0, h1, h2, h3, h4] = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0];
  const w = new Uint32Array(80);
  for (let o = 0; o < total; o += 64) {
    for (let i = 0; i < 16; i++) w[i] = vista.getUint32(o + i * 4);
    for (let i = 16; i < 80; i++) {
      const x = w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16];
      w[i] = (x << 1) | (x >>> 31);
    }
    let [a, b, c, d, e] = [h0, h1, h2, h3, h4];
    for (let i = 0; i < 80; i++) {
      const [f, k] =
        i < 20 ? [(b & c) | (~b & d), 0x5a827999]
        : i < 40 ? [b ^ c ^ d, 0x6ed9eba1]
        : i < 60 ? [(b & c) | (b & d) | (c & d), 0x8f1bbcdc]
        : [b ^ c ^ d, 0xca62c1d6];
      const t = (((a << 5) | (a >>> 27)) + f + e + k + w[i]) >>> 0;
      [e, d, c, b, a] = [d, c, ((b << 30) | (b >>> 2)) >>> 0, a, t];
    }
    [h0, h1, h2, h3, h4] = [(h0 + a) >>> 0, (h1 + b) >>> 0, (h2 + c) >>> 0, (h3 + d) >>> 0, (h4 + e) >>> 0];
  }
  const salida = new DataView(new ArrayBuffer(20));
  [h0, h1, h2, h3, h4].forEach((h, i) => salida.setUint32(i * 4, h));
  return salida.buffer;
}

const aBytes = (datos: BufferSource) =>
  ArrayBuffer.isView(datos) ? new Uint8Array(datos.buffer, datos.byteOffset, datos.byteLength) : new Uint8Array(datos);

export function completarCryptoSubtle() {
  if (typeof window === "undefined" || window.crypto?.subtle) return;
  Object.defineProperty(window.crypto, "subtle", {
    configurable: true,
    value: {
      async digest(algoritmo: AlgorithmIdentifier, datos: BufferSource) {
        const nombre = typeof algoritmo === "string" ? algoritmo : algoritmo.name;
        if (nombre.toUpperCase() !== "SHA-1") throw new Error(`${nombre} no disponible fuera de HTTPS`);
        return sha1(aBytes(datos));
      },
    },
  });
}
