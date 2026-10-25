import type { Metadata } from "next";
import { FormularioContacto } from "@/components/formularios/Formularios";
import { EncabezadoPagina } from "@/components/layout/EncabezadoPagina";
import { obtenerAjustes } from "@/lib/catalogo";
import { enlaceWhatsApp } from "@/lib/precios";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Escríbenos por WhatsApp o déjanos un mensaje.",
};

export default async function PaginaContacto() {
  const ajustes = await obtenerAjustes();
  return (
    <>
      <EncabezadoPagina titulo="Contacto" descripcion="¿Tienes dudas sobre un pedido, tallas o envíos? Escríbenos." />
      <div className="contenedor grid gap-12 py-12 lg:grid-cols-[1fr_2fr]">
        <aside className="space-y-6">
          <div>
            <h2 className="rotulo mb-2">WhatsApp</h2>
            <a href={enlaceWhatsApp(ajustes.whatsapp)} target="_blank" rel="noopener noreferrer" className="text-lg underline">
              +{ajustes.whatsapp.replace(/^(\d{2})(\d{3})(\d{3})(\d+)$/, "$1 $2 $3 $4")}
            </a>
            <p className="mt-1 text-sm text-tenue">La forma más rápida de comunicarte con nosotros.</p>
          </div>
          {ajustes.correo && (
            <div>
              <h2 className="rotulo mb-2">Correo</h2>
              <a href={`mailto:${ajustes.correo}`} className="underline">
                {ajustes.correo}
              </a>
            </div>
          )}
        </aside>
        <section aria-labelledby="titulo-formulario">
          <h2 id="titulo-formulario" className="titulo mb-6 text-lg">
            Envíanos un mensaje
          </h2>
          <FormularioContacto />
        </section>
      </div>
    </>
  );
}
