"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegistroPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    rol: "ESTUDIANTE" as "ESTUDIANTE" | "DOCENTE",
    programa: "Ciencias Naturales y Educación Ambiental",
    semestre: "3",
    codigoDocente: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function registrar() {
    setError(null);
    setCargando(true);
    try {
      const res = await fetch("/api/registro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(form.rol === "DOCENTE" ? { "x-codigo-docente": form.codigoDocente } : {}),
        },
        body: JSON.stringify({
          nombre: form.nombre,
          email: form.email,
          password: form.password,
          rol: form.rol,
          programa: form.programa,
          semestre: Number(form.semestre),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo registrar.");
        return;
      }
      // Inicia sesión automáticamente.
      const login = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (login?.error) {
        router.push("/login");
      } else {
        router.push(form.rol === "DOCENTE" ? "/docente" : "/lobby");
      }
    } catch {
      setError("Error de red. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="container flex min-h-screen items-center justify-center py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Crear cuenta</CardTitle>
          <CardDescription>Regístrate para jugar o administrar el aula.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre completo</Label>
            <Input id="nombre" value={form.nombre} onChange={(e) => set("nombre", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Correo</Label>
            <Input id="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña (mín. 6)</Label>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
            />
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Rol</legend>
            <div className="flex gap-2">
              {(["ESTUDIANTE", "DOCENTE"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  role="radio"
                  aria-checked={form.rol === r}
                  onClick={() => set("rol", r)}
                  className={`flex-1 rounded-md border px-3 py-2 text-sm ${
                    form.rol === r ? "border-primary bg-primary/10" : "border-border"
                  }`}
                >
                  {r === "ESTUDIANTE" ? "🎓 Estudiante" : "👩‍🏫 Docente"}
                </button>
              ))}
            </div>
          </fieldset>

          {form.rol === "ESTUDIANTE" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="programa">Programa</Label>
                <Input id="programa" value={form.programa} onChange={(e) => set("programa", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="semestre">Semestre</Label>
                <Input
                  id="semestre"
                  inputMode="numeric"
                  value={form.semestre}
                  onChange={(e) => set("semestre", e.target.value.replace(/\D/g, ""))}
                />
              </div>
            </div>
          )}

          {form.rol === "DOCENTE" && (
            <div className="space-y-2">
              <Label htmlFor="codigoDocente">Código de invitación docente</Label>
              <Input
                id="codigoDocente"
                value={form.codigoDocente}
                onChange={(e) => set("codigoDocente", e.target.value)}
                placeholder="UT-DOCENTE"
              />
            </div>
          )}

          <Button
            className="w-full"
            onClick={registrar}
            disabled={cargando || form.nombre.length < 2 || form.password.length < 6}
          >
            {cargando ? "Creando…" : "Crear cuenta"}
          </Button>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <p className="text-center text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-primary underline-offset-4 hover:underline">
              Ingresa
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
