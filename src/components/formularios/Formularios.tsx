import Link from "next/link";
import { avisarDisponibilidad, enviarContacto, registrarReclamo, suscribirNewsletter } from "@/lib/acciones";
import { Campo, Formulario } from "./Formulario";

export function FormularioContacto() {
  return (
    <Formulario accion={enviarContacto} textoBoton="Enviar mensaje">
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo etiqueta="Nombre" nombre="nombre" autoComplete="name" minLength={2} maxLength={80} />
        <Campo etiqueta="Correo" nombre="correo" tipo="email" autoComplete="email" maxLength={120} />
      </div>
      <Campo etiqueta="Teléfono" nombre="telefono" tipo="tel" autoComplete="tel" requerido={false} maxLength={20} />
      <Campo etiqueta="Mensaje" nombre="mensaje" multilinea minLength={10} maxLength={2000} />
    </Formulario>
  );
}

export function FormularioNewsletter() {
  return (
    <Formulario accion={suscribirNewsletter} textoBoton="Suscribirme" className="flex flex-col gap-3" ocultarAlEnviar>
      <label htmlFor="newsletter-correo" className="sr-only">
        Correo electrónico
      </label>
      <input
        id="newsletter-correo"
        name="correo"
        type="email"
        required
        maxLength={120}
        autoComplete="email"
        placeholder="tu@correo.com"
        className="campo"
      />
    </Formulario>
  );
}

export function FormularioAvisame({ producto, tallas }: { producto: string; tallas: string[] }) {
  return (
    <Formulario accion={avisarDisponibilidad} textoBoton="Avísame" ocultarAlEnviar>
      <input type="hidden" name="producto" value={producto} />
      <div>
        <label htmlFor="avisame-talla" className="etiqueta-campo">
          Talla
        </label>
        <select id="avisame-talla" name="talla" required className="campo">
          {tallas.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>
      <Campo etiqueta="Nombre" nombre="nombre" autoComplete="name" minLength={2} maxLength={80} />
      <Campo etiqueta="WhatsApp o correo" nombre="contacto" minLength={6} maxLength={120} />
    </Formulario>
  );
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-4 border border-linea bg-white/40 p-4 sm:p-6">
      <legend className="rotulo px-2">{titulo}</legend>
      {children}
    </fieldset>
  );
}

function Opciones({ nombre, etiqueta, opciones }: { nombre: string; etiqueta: string; opciones: string[] }) {
  return (
    <div role="radiogroup" aria-label={etiqueta}>
      <span className="etiqueta-campo">
        {etiqueta} <span aria-hidden="true">*</span>
      </span>
      <div className="flex flex-wrap gap-4">
        {opciones.map((o) => (
          <label key={o} className="flex items-center gap-2 text-sm">
            <input type="radio" name={nombre} value={o} required className="accent-cacao" />
            {o}
          </label>
        ))}
      </div>
    </div>
  );
}

export function FormularioReclamo() {
  return (
    <Formulario accion={registrarReclamo} textoBoton="Enviar hoja de reclamación" className="space-y-6" ocultarAlEnviar>
      <Seccion titulo="1. Datos del consumidor">
        <Campo etiqueta="Nombre completo" nombre="nombre" autoComplete="name" minLength={3} maxLength={100} />
        <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
          <div>
            <label htmlFor="campo-tipoDocumento" className="etiqueta-campo">
              Documento <span aria-hidden="true">*</span>
            </label>
            <select id="campo-tipoDocumento" name="tipoDocumento" required className="campo">
              <option>DNI</option>
              <option>CE</option>
              <option>Pasaporte</option>
              <option>RUC</option>
            </select>
          </div>
          <Campo etiqueta="Número de documento" nombre="numeroDocumento" pattern="[A-Za-z0-9]{6,15}" maxLength={15} />
        </div>
        <Campo etiqueta="Domicilio" nombre="domicilio" autoComplete="street-address" minLength={5} maxLength={200} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Teléfono" nombre="telefono" tipo="tel" autoComplete="tel" minLength={6} maxLength={20} />
          <Campo etiqueta="Correo" nombre="correo" tipo="email" autoComplete="email" maxLength={120} />
        </div>
        <Campo
          etiqueta="Padre, madre o apoderado (solo si eres menor de edad)"
          nombre="apoderado"
          requerido={false}
          maxLength={100}
        />
      </Seccion>

      <Seccion titulo="2. Producto o servicio contratado">
        <Opciones nombre="tipoBien" etiqueta="Tipo" opciones={["Producto", "Servicio"]} />
        <Campo
          etiqueta="Monto reclamado (S/)"
          nombre="montoReclamado"
          requerido={false}
          inputMode="decimal"
          pattern="\d{1,6}(\.\d{1,2})?"
          placeholder="45.00"
        />
        <Campo etiqueta="Descripción" nombre="descripcionBien" minLength={3} maxLength={300} placeholder="Ej.: Polo Oversize Andes talla M, pedido del 20/10" />
      </Seccion>

      <Seccion titulo="3. Detalle de la reclamación">
        <Opciones nombre="tipo" etiqueta="Tipo" opciones={["Reclamo", "Queja"]} />
        <p className="text-xs leading-relaxed text-tenue">
          <strong>Reclamo:</strong> disconformidad relacionada con los productos o servicios.{" "}
          <strong>Queja:</strong> disconformidad no relacionada con los productos o servicios, o malestar respecto a
          la atención al público.
        </p>
        <Campo etiqueta="Detalle" nombre="detalle" multilinea minLength={10} maxLength={3000} />
        <Campo etiqueta="Pedido del consumidor" nombre="pedido" multilinea minLength={5} maxLength={2000} />
      </Seccion>

      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" name="aceptaPrivacidad" required className="mt-1 accent-cacao" />
        <span>
          Acepto la{" "}
          <Link href="/privacidad" className="underline">
            política de privacidad
          </Link>{" "}
          y el tratamiento de mis datos para atender esta reclamación.
        </span>
      </label>
    </Formulario>
  );
}
