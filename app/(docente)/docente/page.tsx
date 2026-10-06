import { auth } from "@/auth";
import { DashboardDocente } from "./DashboardDocente";

export const dynamic = "force-dynamic";

// El middleware ya garantiza rol DOCENTE; aquí solo obtenemos el nombre.
export default async function DocentePage() {
  const session = await auth();
  const nombre = session?.user?.name ?? session?.user?.email ?? "Docente";
  return <DashboardDocente nombre={nombre} />;
}
