import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { accesoConfigurado, sesionValida } from "@/lib/sesion";
import { salir } from "./acciones";
import { FormularioAcceso } from "./FormularioAcceso";

export const metadata: Metadata = {
  title: "Acceso",
  robots: { index: false, follow: false },
};

export default async function PaginaAcceso() {
  // El CMS solo existe en local
  if (process.env.NODE_ENV === "production") notFound();
  const [configurado, conectado] = [accesoConfigurado(), await sesionValida()];

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="aparece w-full max-w-sm space-y-8 border border-linea bg-white/50 p-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <Image src="/images/marca/isotipo.png" alt="" width={400} height={626} preload className="h-16 w-auto" />
          <h1 className="titulo text-xl">Panel BOSQO</h1>
          <p className="text-sm text-tenue">Acceso solo para administradores</p>
        </div>

        {!configurado ? (
          <p role="alert" className="border border-error/30 bg-error/5 p-3 text-sm text-error">
            El acceso no está configurado. Ejecuta <code>node scripts/crear-acceso.mjs</code> y reinicia el servidor.
          </p>
        ) : conectado ? (
          <div className="space-y-3">
            <p className="text-center text-sm">Ya iniciaste sesión.</p>
            <Link href="/keystatic" className="boton w-full">
              Ir al panel
            </Link>
            <form action={salir}>
              <button type="submit" className="boton-borde w-full">
                Cerrar sesión
              </button>
            </form>
          </div>
        ) : (
          <FormularioAcceso />
        )}
      </div>
    </main>
  );
}
