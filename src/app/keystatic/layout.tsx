import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { sesionValida } from "@/lib/sesion";
import KeystaticApp from "./keystatic";

export const metadata: Metadata = {
  title: "Administración",
  robots: { index: false, follow: false },
};

// Exige iniciar sesión en /acceso (la API también lo verifica).
// En la web publicada, después Keystatic pide además entrar con GitHub.
export default async function LayoutKeystatic() {
  if (!(await sesionValida())) redirect("/acceso");
  return <KeystaticApp />;
}
