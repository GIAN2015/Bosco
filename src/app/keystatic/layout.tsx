import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { sesionValida } from "@/lib/sesion";
import KeystaticApp from "./keystatic";

export const metadata: Metadata = {
  title: "Administración",
  robots: { index: false, follow: false },
};

// El panel guarda en archivos locales: en producción (Vercel) no existe.
// En local exige iniciar sesión en /acceso (la API también lo verifica).
export default async function LayoutKeystatic() {
  if (process.env.NODE_ENV === "production") notFound();
  if (!(await sesionValida())) redirect("/acceso");
  return <KeystaticApp />;
}
