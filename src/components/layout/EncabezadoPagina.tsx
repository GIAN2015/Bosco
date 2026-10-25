import Link from "next/link";

export function EncabezadoPagina({
  titulo,
  rotulo,
  descripcion,
  migas = [],
}: {
  titulo: string;
  rotulo?: string;
  descripcion?: string;
  migas?: { href: string; texto: string }[];
}) {
  return (
    <div className="border-b border-linea bg-arena/40">
      <div className="contenedor py-10 sm:py-14">
        <nav aria-label="Migas de pan" className="mb-4 text-xs text-tenue">
          <ol className="flex flex-wrap gap-2">
            {[{ href: "/", texto: "Inicio" }, ...migas].map((m) => (
              <li key={m.href} className="after:ml-2 after:content-['/']">
                <Link href={m.href} className="hover:underline">
                  {m.texto}
                </Link>
              </li>
            ))}
            <li aria-current="page">{titulo}</li>
          </ol>
        </nav>
        {rotulo && <p className="rotulo text-tenue">{rotulo}</p>}
        <h1 className="titulo mt-2 text-3xl sm:text-4xl">{titulo}</h1>
        {descripcion && <p className="mt-4 max-w-2xl text-tenue">{descripcion}</p>}
      </div>
    </div>
  );
}
