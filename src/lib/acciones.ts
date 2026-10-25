"use server";

import { randomBytes } from "node:crypto";
import { z } from "zod";
import { enviarCorreo } from "./correo";
import { verificarEnvio } from "./seguridad";
import { obtenerProducto } from "./catalogo";

// Server Actions de los formularios. Next.js ya rechaza peticiones de otros
// orígenes (protección CSRF); aquí se valida todo de nuevo en el servidor.

export type EstadoFormulario = {
  estado: "inicial" | "ok" | "error";
  mensaje: string;
  codigo?: string;
  // Distinto en cada respuesta: permite reaccionar a errores repetidos (p. ej. renovar el captcha)
  intento?: string;
};

const leer = (formData: FormData, ...campos: string[]) =>
  Object.fromEntries(campos.map((c) => [c, String(formData.get(c) ?? "").trim()]));

const texto = (min: number, max: number, campo: string) =>
  z
    .string()
    .min(min, `${campo}: escribe al menos ${min} caracteres.`)
    .max(max, `${campo}: máximo ${max} caracteres.`);
const correo = z.email("Escribe un correo válido.").max(120, "El correo es demasiado largo.");
const telefono = z.string().regex(/^[\d +()-]{6,20}$/, "Escribe un teléfono válido.");

const error = (mensaje: string): EstadoFormulario => ({ estado: "error", mensaje });
const errorValidacion = (e: z.ZodError): EstadoFormulario =>
  error([...new Set(e.issues.map((i) => i.message))].join(" "));
const ERROR_ENVIO = error("No pudimos enviar tu mensaje. Inténtalo de nuevo o escríbenos por WhatsApp.");

async function proteger(formData: FormData, formulario: string, exito: EstadoFormulario) {
  const verificacion = await verificarEnvio(formData, formulario);
  if (verificacion.ok) return null;
  return verificacion.silencioso ? exito : error(verificacion.mensaje);
}

export async function enviarContacto(_: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const exito: EstadoFormulario = { estado: "ok", mensaje: "¡Gracias! Te responderemos pronto." };
  const bloqueo = await proteger(formData, "contacto", exito);
  if (bloqueo) return bloqueo;

  const datos = z
    .object({
      nombre: texto(2, 80, "Nombre"),
      correo,
      telefono: telefono.or(z.literal("")),
      mensaje: texto(10, 2000, "Mensaje"),
    })
    .safeParse(leer(formData, "nombre", "correo", "telefono", "mensaje"));
  if (!datos.success) return errorValidacion(datos.error);

  const d = datos.data;
  const ok = await enviarCorreo({
    asunto: `Contacto web: ${d.nombre}`,
    texto: `Nombre: ${d.nombre}\nCorreo: ${d.correo}\nTeléfono: ${d.telefono || "-"}\n\n${d.mensaje}`,
    responderA: d.correo,
  });
  return ok ? exito : ERROR_ENVIO;
}

export async function suscribirNewsletter(_: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const exito: EstadoFormulario = { estado: "ok", mensaje: "¡Listo! Te avisaremos de cada nuevo drop." };
  const bloqueo = await proteger(formData, "newsletter", exito);
  if (bloqueo) return bloqueo;

  const datos = z.object({ correo }).safeParse(leer(formData, "correo"));
  if (!datos.success) return errorValidacion(datos.error);

  const ok = await enviarCorreo({
    asunto: "Nueva suscripción al newsletter",
    texto: `Correo: ${datos.data.correo}`,
  });
  return ok ? exito : ERROR_ENVIO;
}

export async function avisarDisponibilidad(_: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const exito: EstadoFormulario = { estado: "ok", mensaje: "¡Anotado! Te avisaremos cuando vuelva tu talla." };
  const bloqueo = await proteger(formData, "avisame", exito);
  if (bloqueo) return bloqueo;

  const datos = z
    .object({
      producto: z.string().max(100),
      talla: z.string().max(5),
      nombre: texto(2, 80, "Nombre"),
      contacto: texto(6, 120, "WhatsApp o correo"),
    })
    .safeParse(leer(formData, "producto", "talla", "nombre", "contacto"));
  if (!datos.success) return errorValidacion(datos.error);

  const d = datos.data;
  const producto = await obtenerProducto(d.producto);
  if (!producto || !producto.tallas.some((t) => t.talla === d.talla)) return error("Elige una talla válida.");

  const ok = await enviarCorreo({
    asunto: `Avísame: ${producto.nombre} talla ${d.talla}`,
    texto: `${d.nombre} quiere que le avisen cuando vuelva:\n\nProducto: ${producto.nombre}\nTalla: ${d.talla}\nContacto: ${d.contacto}`,
  });
  return ok ? exito : ERROR_ENVIO;
}

export async function registrarReclamo(_: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const bloqueo = await proteger(formData, "reclamo", { estado: "ok", mensaje: "Reclamo registrado." });
  if (bloqueo) return bloqueo;

  const datos = z
    .object({
      nombre: texto(3, 100, "Nombre completo"),
      tipoDocumento: z.enum(["DNI", "CE", "Pasaporte", "RUC"], "Elige el tipo de documento."),
      numeroDocumento: z.string().regex(/^[A-Za-z0-9]{6,15}$/, "Escribe un número de documento válido."),
      domicilio: texto(5, 200, "Domicilio"),
      telefono,
      correo,
      apoderado: z.string().max(100),
      tipoBien: z.enum(["Producto", "Servicio"], "Indica si es un producto o servicio."),
      montoReclamado: z.string().regex(/^(\d{1,6}(\.\d{1,2})?)?$/, "Escribe un monto válido (ej.: 45 o 45.50)."),
      descripcionBien: texto(3, 300, "Descripción del producto o servicio"),
      tipo: z.enum(["Reclamo", "Queja"], "Indica si es un reclamo o una queja."),
      detalle: texto(10, 3000, "Detalle"),
      pedido: texto(5, 2000, "Pedido"),
      aceptaPrivacidad: z.literal("on", "Debes aceptar la política de privacidad."),
    })
    .safeParse(
      leer(formData, "nombre", "tipoDocumento", "numeroDocumento", "domicilio", "telefono", "correo", "apoderado",
        "tipoBien", "montoReclamado", "descripcionBien", "tipo", "detalle", "pedido", "aceptaPrivacidad"),
    );
  if (!datos.success) return errorValidacion(datos.error);

  const d = datos.data;
  const fecha = new Date();
  const codigo = `LR-${fecha.toISOString().slice(0, 10).replaceAll("-", "")}-${randomBytes(3).toString("hex").toUpperCase()}`;
  const fechaLegible = fecha.toLocaleString("es-PE", { timeZone: "America/Lima" });
  const hoja = [
    `HOJA DE RECLAMACIÓN N.° ${codigo}`,
    `Fecha: ${fechaLegible}`,
    "",
    "1. IDENTIFICACIÓN DEL CONSUMIDOR",
    `Nombre: ${d.nombre}`,
    `Documento: ${d.tipoDocumento} ${d.numeroDocumento}`,
    `Domicilio: ${d.domicilio}`,
    `Teléfono: ${d.telefono}`,
    `Correo: ${d.correo}`,
    `Padre, madre o apoderado (si es menor de edad): ${d.apoderado || "-"}`,
    "",
    "2. IDENTIFICACIÓN DEL BIEN CONTRATADO",
    `Tipo: ${d.tipoBien}`,
    `Monto reclamado: ${d.montoReclamado ? `S/ ${d.montoReclamado}` : "-"}`,
    `Descripción: ${d.descripcionBien}`,
    "",
    "3. DETALLE DE LA RECLAMACIÓN",
    `Tipo: ${d.tipo}`,
    `Detalle: ${d.detalle}`,
    `Pedido del consumidor: ${d.pedido}`,
  ].join("\n");

  const okTienda = await enviarCorreo({ asunto: `${d.tipo} ${codigo}`, texto: hoja, responderA: d.correo });
  if (!okTienda) return error("No pudimos registrar tu reclamo. Inténtalo de nuevo en unos minutos.");
  await enviarCorreo({
    para: d.correo,
    asunto: `Constancia de tu ${d.tipo.toLowerCase()} ${codigo} - BOSQO`,
    texto: `Hemos recibido tu ${d.tipo.toLowerCase()}. Te responderemos en un plazo máximo de 15 días hábiles.\n\n${hoja}`,
  });
  return {
    estado: "ok",
    codigo,
    mensaje: `Registramos tu ${d.tipo.toLowerCase()} con el código ${codigo}. Te enviamos una copia a ${d.correo}.`,
  };
}
