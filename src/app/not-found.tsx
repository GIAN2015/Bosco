import Image from "next/image";
import Link from "next/link";

export default function NoEncontrado() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-24 text-center">
      <Image src="/images/marca/isotipo.png" alt="" width={400} height={626} className="h-24 w-auto" />
      <p className="rotulo text-tenue">Error 404</p>
      <h1 className="titulo text-2xl sm:text-3xl">Esta página no existe</h1>
      <p className="max-w-md text-tenue">Puede que el enlace esté mal escrito o que el producto ya no esté disponible.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/" className="boton">
          Ir al inicio
        </Link>
        <Link href="/tienda" className="boton-borde">
          Ver la tienda
        </Link>
      </div>
    </main>
  );
}
