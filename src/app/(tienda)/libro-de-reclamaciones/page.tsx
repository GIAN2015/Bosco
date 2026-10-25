import type { Metadata } from "next";
import { FormularioReclamo } from "@/components/formularios/Formularios";
import { EncabezadoPagina } from "@/components/layout/EncabezadoPagina";
import { obtenerAjustes } from "@/lib/catalogo";

export const metadata: Metadata = {
  title: "Libro de reclamaciones",
  description: "Libro de reclamaciones virtual de BOSQO conforme al Código de Protección y Defensa del Consumidor.",
};

export default async function PaginaReclamaciones() {
  const { empresa } = await obtenerAjustes();
  return (
    <>
      <EncabezadoPagina
        titulo="Libro de reclamaciones"
        descripcion="Conforme a lo establecido en el Código de Protección y Defensa del Consumidor (Ley N.° 29571), contamos con un Libro de Reclamaciones virtual."
      />
      <div className="contenedor max-w-3xl space-y-8 py-12">
        <dl className="grid gap-x-6 gap-y-2 border border-linea bg-white/40 p-4 text-sm sm:grid-cols-[auto_1fr] sm:p-6">
          <dt className="font-medium">Proveedor</dt>
          <dd>{empresa.razonSocial || "BOSQO"}</dd>
          {empresa.ruc && (
            <>
              <dt className="font-medium">RUC</dt>
              <dd>{empresa.ruc}</dd>
            </>
          )}
          {empresa.direccion && (
            <>
              <dt className="font-medium">Dirección</dt>
              <dd>{empresa.direccion}</dd>
            </>
          )}
        </dl>

        <FormularioReclamo />

        <p className="text-xs leading-relaxed text-tenue">
          La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito previo
          para interponer una denuncia ante el INDECOPI. El proveedor deberá dar respuesta al reclamo en un plazo no
          mayor a quince (15) días hábiles. Recibirás una copia de tu hoja de reclamación en el correo que indiques.
        </p>
      </div>
    </>
  );
}
