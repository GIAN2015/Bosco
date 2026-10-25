import { EncabezadoPagina } from "./EncabezadoPagina";

// Convierte el texto del CMS en párrafos: línea en blanco = nuevo párrafo,
// "## " = subtítulo y líneas que empiezan con "1." o "-" = lista.
function Bloque({ texto }: { texto: string }) {
  if (texto.startsWith("## ")) return <h2 className="titulo pt-4 text-lg">{texto.slice(3)}</h2>;
  const lineas = texto.split("\n");
  if (lineas.every((l) => /^(\d+\.|-)\s/.test(l))) {
    const Lista = /^\d/.test(lineas[0]) ? "ol" : "ul";
    return (
      <Lista className={`space-y-1 pl-5 ${Lista === "ol" ? "list-decimal" : "list-disc"}`}>
        {lineas.map((l) => (
          <li key={l}>{l.replace(/^(\d+\.|-)\s/, "")}</li>
        ))}
      </Lista>
    );
  }
  return <p>{texto}</p>;
}

export function PaginaTexto({ titulo, texto, children }: { titulo: string; texto: string; children?: React.ReactNode }) {
  const bloques = texto
    .split(/\n\s*\n|\n(?=## )|(?<=^## .*)\n/m)
    .map((b) => b.trim())
    .filter(Boolean);
  return (
    <>
      <EncabezadoPagina titulo={titulo} />
      <div className="contenedor max-w-3xl space-y-4 py-12 leading-relaxed">
        {bloques.map((b, i) => (
          <Bloque key={i} texto={b} />
        ))}
        {children}
      </div>
    </>
  );
}
