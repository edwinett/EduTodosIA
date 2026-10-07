"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/lobby";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [magicEmail, setMagicEmail] = useState("");
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function entrarCredenciales() {
    setError(null);
    setCargando(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setCargando(false);
    if (res?.error) setError("Correo o contraseña incorrectos.");
    else router.push(callbackUrl);
  }

  async function enviarEnlace() {
    setError(null);
    setMensaje(null);
    setCargando(true);
    const res = await signIn("nodemailer", { email: magicEmail, redirect: false, callbackUrl });
    setCargando(false);
    if (res?.error) setError("No se pudo enviar el enlace. Verifica el correo.");
    else
      setMensaje(
        "Revisa tu correo (en desarrollo, el enlace aparece en la consola del servidor).",
      );
  }

  return (
    <div className="container flex min-h-screen items-center justify-center py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Ingresar</CardTitle>
          <CardDescription>Accede como estudiante o docente.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="credenciales">
            <TabsList className="w-full">
              <TabsTrigger value="credenciales" className="flex-1">
                Contraseña
              </TabsTrigger>
              <TabsTrigger value="magico" className="flex-1">
                Enlace mágico
              </TabsTrigger>
            </TabsList>

            <TabsContent value="credenciales" className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="email">Correo</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && entrarCredenciales()}
                />
              </div>
              <Button className="w-full" onClick={entrarCredenciales} disabled={cargando}>
                {cargando ? "Ingresando…" : "Ingresar"}
              </Button>
            </TabsContent>

            <TabsContent value="magico" className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="magic">Correo</Label>
                <Input
                  id="magic"
                  type="email"
                  value={magicEmail}
                  onChange={(e) => setMagicEmail(e.target.value)}
                  placeholder="tu@correo.edu.co"
                />
              </div>
              <Button className="w-full" variant="secondary" onClick={enviarEnlace} disabled={cargando}>
                {cargando ? "Enviando…" : "Enviarme un enlace de acceso"}
              </Button>
              {mensaje && <p className="text-sm text-primary">{mensaje}</p>}
            </TabsContent>
          </Tabs>

          {error && (
            <p role="alert" className="mt-4 text-sm text-destructive">
              {error}
            </p>
          )}

          <p className="mt-4 text-center text-sm text-muted-foreground">
            ¿No tienes cuenta?{" "}
            <Link href="/registro" className="text-primary underline-offset-4 hover:underline">
              Regístrate
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
