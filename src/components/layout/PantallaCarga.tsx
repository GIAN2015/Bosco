import Image from "next/image";

const LOGOS = [
  { region: "costa", ancho: 500, alto: 444 },
  { region: "andes", ancho: 500, alto: 461 },
  { region: "selva", ancho: 476, alto: 527 },
];

// Pantalla de entrada: Costa → Andes → Selva y se desvanece. Es solo CSS (globals.css),
// así que nunca bloquea la página aunque falle JavaScript. Se muestra una vez por sesión:
// el script de app/layout.tsx marca <html data-intro="vista"> en las visitas siguientes.
export function PantallaCarga() {
  return (
    <div className="pantalla-carga" aria-hidden="true">
      <div className="flex flex-col items-center gap-7">
        <div className="carga-logos">
          {LOGOS.map(({ region, ancho, alto }) => (
            <Image key={region} src={`/images/marca/origen-${region}.webp`} alt="" width={ancho} height={alto} sizes="144px" preload />
          ))}
        </div>
        <div className="carga-barra" />
        <p className="rotulo text-tenue">Nuestro origen es estilo</p>
      </div>
    </div>
  );
}
