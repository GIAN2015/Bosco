import "server-only";
import nodemailer from "nodemailer";

// Envío de correos desde una cuenta de Gmail con "contraseña de aplicación".
// Variables de entorno (ver .env.example):
//   GMAIL_USUARIO     la cuenta que envía, p. ej. bosqo@gmail.com
//   GMAIL_CLAVE_APP   contraseña de aplicación de 16 letras (https://myaccount.google.com/apppasswords)
//   CORREO_DESTINO    dónde llegan los formularios (opcional: por defecto, la misma cuenta)

type Correo = {
  asunto: string;
  texto: string;
  para?: string;
  responderA?: string;
};

export async function enviarCorreo({ asunto, texto, para, responderA }: Correo): Promise<boolean> {
  const usuario = process.env.GMAIL_USUARIO;
  // Google muestra la clave en grupos de 4 ("abcd efgh ..."): se aceptan con o sin espacios
  const clave = process.env.GMAIL_CLAVE_APP?.replace(/\s/g, "");
  const destino = para ?? process.env.CORREO_DESTINO ?? usuario;

  if (!usuario || !clave || !destino) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[correo sin configurar] ${asunto}\n${texto}`);
      return true;
    }
    console.error("Faltan GMAIL_USUARIO o GMAIL_CLAVE_APP");
    return false;
  }

  try {
    const transporte = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: usuario, pass: clave },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
    });
    await transporte.sendMail({
      // Gmail siempre envía como la cuenta autenticada
      from: { name: "BOSQO Web", address: usuario },
      to: destino,
      subject: asunto,
      // Solo texto plano: lo que escribe el usuario nunca se interpreta como HTML
      text: texto,
      ...(responderA ? { replyTo: responderA } : {}),
    });
    return true;
  } catch (error) {
    console.error("Error al enviar correo", error);
    return false;
  }
}
