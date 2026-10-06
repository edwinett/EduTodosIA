import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Nodemailer from "next-auth/providers/nodemailer";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { authConfig } from "@/auth.config";
import { loginCredsSchema } from "@/lib/validacion/esquemas";

// Configuración completa (Node runtime): adaptador Prisma + proveedores.
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig, // incluye trustHost
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" }, // JWT: requerido por el proveedor Credentials.
  providers: [
    Credentials({
      name: "Credenciales",
      credentials: {
        email: { label: "Correo", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(creds) {
        const parsed = loginCredsSchema.safeParse(creds);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) return null;
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;
        return { id: user.id, name: user.name, email: user.email, rol: user.rol };
      },
    }),
    Nodemailer({
      // Enlace mágico. En desarrollo el enlace se imprime en consola del servidor;
      // en producción, configurar EMAIL_SERVER (SMTP) y EMAIL_FROM.
      server: process.env.EMAIL_SERVER ?? { host: "localhost", port: 1025 },
      from: process.env.EMAIL_FROM ?? "no-reply@senalperdida.edu.co",
      async sendVerificationRequest({ identifier, url }) {
        if (process.env.EMAIL_SERVER) {
          const { createTransport } = await import("nodemailer");
          const transport = createTransport(process.env.EMAIL_SERVER);
          await transport.sendMail({
            to: identifier,
            from: process.env.EMAIL_FROM ?? "no-reply@senalperdida.edu.co",
            subject: "Tu enlace de acceso a SEÑAL PERDIDA",
            text: `Ingresa con este enlace: ${url}`,
            html: `<p>Ingresa a <strong>SEÑAL PERDIDA</strong> con este enlace:</p><p><a href="${url}">${url}</a></p>`,
          });
        } else {
          // Modo desarrollo sin SMTP: enlace visible en los logs del servidor.
          console.log("\n🔗 [MAGIC LINK] Enlace de acceso para", identifier, "\n   ", url, "\n");
        }
      },
    }),
  ],
});
