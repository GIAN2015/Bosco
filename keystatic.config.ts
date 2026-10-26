import { config, collection, singleton, fields } from "@keystatic/core";

// Panel de administración: http://localhost:3000/keystatic (solo en local).
// Lo que se edita aquí se guarda como archivos en /content y /public/images:
// al hacer git push, Vercel vuelve a publicar la web con los cambios.
export default config({
  storage: { kind: "local" },
  ui: {
    brand: { name: "BOSQO" },
    navigation: {
      Tienda: ["productos", "lineasDePrecio"],
      Sitio: ["ajustes", "politicas"],
    },
  },
  collections: {
    productos: collection({
      label: "Productos",
      slugField: "nombre",
      path: "content/productos/*",
      format: { data: "json" },
      columns: ["categoria", "coleccion", "orden"],
      schema: {
        nombre: fields.slug({
          name: { label: "Nombre", description: "Ej.: Polo Oversize Andes" },
          slug: { label: "URL", description: "Se usa en la dirección: /producto/<url>" },
        }),
        categoria: fields.select({
          label: "Categoría",
          options: [
            { label: "Hombre", value: "hombre" },
            { label: "Mujer", value: "mujer" },
          ],
          defaultValue: "hombre",
        }),
        coleccion: fields.select({
          label: "Colección",
          options: [
            { label: "Essentials", value: "essentials" },
            { label: "Origen", value: "origen" },
          ],
          defaultValue: "essentials",
        }),
        variante: fields.text({
          label: "Diseño / variante",
          description: "Se muestra como BOSQO ORIGEN · COSTA. Ej.: Costa, Negro, Hueso",
          validation: { isRequired: true },
        }),
        color: fields.text({ label: "Color", description: "Ej.: Celeste denim" }),
        lineaDePrecio: fields.relationship({
          label: "Línea de precio",
          description: "Define el precio unitario y las promociones por 2 y 3 unidades",
          collection: "lineasDePrecio",
          validation: { isRequired: true },
        }),
        descripcion: fields.text({ label: "Descripción", multiline: true }),
        detalles: fields.array(fields.text({ label: "Detalle" }), {
          label: "Detalles",
          itemLabel: (props) => props.value,
        }),
        imagenes: fields.array(
          fields.image({
            label: "Imagen",
            directory: "public/images/productos",
            publicPath: "/images/productos/",
            validation: { isRequired: true },
          }),
          { label: "Fotos", description: "La primera es la portada; la segunda se ve al pasar el mouse" },
        ),
        tallas: fields.array(
          fields.object({
            talla: fields.select({
              label: "Talla",
              options: ["XS", "S", "M", "L", "XL", "XXL"].map((t) => ({ label: t, value: t })),
              defaultValue: "M",
            }),
            disponible: fields.checkbox({ label: "Disponible", defaultValue: true }),
          }),
          {
            label: "Tallas",
            itemLabel: (props) =>
              `${props.fields.talla.value}${props.fields.disponible.value ? "" : " (agotada)"}`,
          },
        ),
        nuevo: fields.checkbox({ label: "Mostrar etiqueta NUEVO", defaultValue: false }),
        destacado: fields.checkbox({ label: "Mostrar en la portada", defaultValue: false }),
        orden: fields.integer({ label: "Orden", description: "Menor número = aparece primero", defaultValue: 10 }),
      },
    }),
    lineasDePrecio: collection({
      label: "Líneas de precio",
      slugField: "nombre",
      path: "content/lineas-de-precio/*",
      format: { data: "json" },
      schema: {
        nombre: fields.slug({ name: { label: "Nombre", description: "Ej.: Hombre (Essentials y Origen)" } }),
        unidad: fields.integer({ label: "Precio por 1 unidad (S/)", validation: { isRequired: true, min: 1 } }),
        regular: fields.integer({
          label: "Precio regular (S/), se muestra tachado",
          description: "Mayor que el precio por 1 unidad para mostrar el descuento. Vacío = sin descuento",
          validation: { min: 1 },
        }),
        pack2: fields.integer({ label: "Precio por 2 unidades (S/)", description: "Vacío = sin promoción", validation: { min: 1 } }),
        pack3: fields.integer({ label: "Precio por 3 unidades (S/)", description: "Vacío = sin promoción", validation: { min: 1 } }),
      },
    }),
  },
  singletons: {
    ajustes: singleton({
      label: "Ajustes de la tienda",
      path: "content/ajustes",
      format: { data: "json" },
      schema: {
        whatsapp: fields.text({
          label: "WhatsApp para pedidos",
          description: "Con código de país y sin espacios. Ej.: 51936210839",
          validation: { isRequired: true, pattern: { regex: /^\d{8,15}$/, message: "Solo números, con código de país" } },
        }),
        correo: fields.text({ label: "Correo de contacto (visible en la web)" }),
        anuncio: fields.text({ label: "Barra de anuncio superior", description: "Vacío = no se muestra" }),
        heroTitulo: fields.text({ label: "Portada: título" }),
        heroTexto: fields.text({ label: "Portada: texto", multiline: true }),
        portada: fields.array(
          fields.object({
            imagen: fields.image({
              label: "Imagen",
              directory: "public/images/inicio",
              publicPath: "/images/inicio/",
              validation: { isRequired: true },
            }),
            alt: fields.text({
              label: "Descripción de la imagen",
              description: "Para personas con lector de pantalla y para Google. Ej.: Modelos con polo BOSQO negro y croptop blanco",
            }),
            enlace: fields.text({
              label: "Enlace al hacer clic (opcional)",
              description: "Una página de la tienda, ej.: /tienda/origen. Vacío = sin enlace",
            }),
          }),
          {
            label: "Carrusel de portada",
            description: "Imágenes horizontales (ideal 1920×1080). Arrastra para cambiar el orden; la primera se muestra al entrar.",
            itemLabel: (props) => props.fields.alt.value || "Imagen sin descripción",
          },
        ),
        beneficios: fields.array(fields.text({ label: "Beneficio" }), {
          label: "Beneficios (franja de la portada)",
          itemLabel: (props) => props.value,
        }),
        notaTallas: fields.text({
          label: "Nota de tallas (página de producto)",
          multiline: true,
        }),
        redes: fields.object(
          {
            instagram: fields.url({ label: "Instagram" }),
            tiktok: fields.url({ label: "TikTok" }),
            facebook: fields.url({ label: "Facebook" }),
          },
          { label: "Redes sociales" },
        ),
        empresa: fields.object(
          {
            razonSocial: fields.text({ label: "Razón social o nombre del titular" }),
            ruc: fields.text({ label: "RUC" }),
            direccion: fields.text({ label: "Dirección fiscal" }),
          },
          { label: "Datos legales (Libro de Reclamaciones)" },
        ),
      },
    }),
    politicas: singleton({
      label: "Páginas legales y de ayuda",
      path: "content/politicas",
      format: { data: "json" },
      schema: {
        envios: fields.text({ label: "Envíos", multiline: true, description: "Separa párrafos con una línea en blanco. '## ' al inicio = subtítulo" }),
        cambios: fields.text({ label: "Cambios y devoluciones", multiline: true }),
        privacidad: fields.text({ label: "Política de privacidad", multiline: true }),
        terminos: fields.text({ label: "Términos y condiciones", multiline: true }),
      },
    }),
  },
});
