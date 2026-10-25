import { ViewTransition } from "react";

// La plantilla se vuelve a montar en cada navegación: el contenido saliente se desvanece
// y el nuevo sube suavemente (estilos .pagina en globals.css).
export default function Plantilla({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter="pagina" exit="pagina" default="none">
      <div>{children}</div>
    </ViewTransition>
  );
}
