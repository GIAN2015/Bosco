import "server-only";

// Envío de correos con Resend (https://resend.com) mediante su API HTTP.
// Variables de entorno: RESEND_API_KEY, CORREO_REMITENTE, CORREO_DESTINO (ver .env.example).

type Correo = {
  asunto: string;
  texto: string;
  para?: string;
  responderA?: string;
};

export async function enviarCorreo({ asunto, texto, para, responderA }: Correo): Promise<boolean> {
  const clave = process.env.RESEND_API_KEY;
  const remitente = process.env.CORREO_REMITENTE;
  const destino = para ?? process.env.CORREO_DESTINO;

  if (!clave || !remitente || !destino) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[correo sin configurar] ${asunto}\n${texto}`);
      return true;
    }
    console.error("Faltan RESEND_API_KEY, CORREO_REMITENTE o CORREO_DESTINO");
    return false;
  }

  try {
    const respuesta = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${clave}`, "Content-Type": "application/json" },
      // Solo texto plano: lo que escribe el usuario nunca se interpreta como HTML
      body: JSON.stringify({
        from: remitente,
        to: [destino],
        subject: asunto,
        text: texto,
        ...(responderA ? { reply_to: responderA } : {}),
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!respuesta.ok) console.error("Resend respondió", respuesta.status, await respuesta.text());
    return respuesta.ok;
  } catch (error) {
    console.error("Error al enviar correo", error);
    return false;
  }
}
