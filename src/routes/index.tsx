import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Moon, Sun } from "lucide-react";
import { Btn, Field, Input } from "@/components/panel/kit";
import { useTheme } from "@/lib/theme";
import { useSession } from "@/providers/session-provider";
import { loginErrorMessage } from "@/lib/login-error";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Piddop — Ingreso al panel" },
      { name: "description", content: "Inicia sesión en el panel web de Piddop." },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const { dark, toggle } = useTheme();
  const { login, status } = useSession();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === "authenticated") void navigate({ to: "/panel", replace: true });
  }, [navigate, status]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim() || !password) return setError("Ingresa tu correo y contraseña.");
    setError("");
    setIsSubmitting(true);
    try {
      await login(email, password);
      await navigate({ to: "/panel", replace: true });
    } catch (requestError) {
      setError(loginErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-sidebar p-12 text-sidebar-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-32 -top-32 size-96 rounded-full bg-primary/40 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 size-80 rounded-full bg-accent/40 blur-3xl" />
        <span className="relative font-display text-3xl font-bold">
          pidd<span className="text-primary">o</span>p<span className="text-accent">.</span>
        </span>
        <div className="relative">
          <h1 className="font-display text-5xl font-bold leading-tight">
            Todo tu negocio,
            <br />
            <span className="text-primary">en un solo panel.</span>
          </h1>
          <p className="mt-4 max-w-md opacity-70">
            Pedidos, citas, catálogo, equipo y pagos. Para la plataforma y cada empresa.
          </p>
        </div>
        <nav
          className="relative flex flex-wrap gap-x-3 gap-y-1 text-xs opacity-60"
          aria-label="Enlaces legales"
        >
          <Link to="/legal/$page" params={{ page: "terminos" }}>
            Términos
          </Link>
          <Link to="/legal/$page" params={{ page: "privacidad" }}>
            Privacidad
          </Link>
          <Link to="/legal/$page" params={{ page: "datos" }}>
            Autorización de datos
          </Link>
          <Link to="/legal/$page" params={{ page: "eliminar-cuenta" }}>
            Eliminar cuenta
          </Link>
          <Link to="/legal/$page" params={{ page: "soporte" }}>
            Soporte
          </Link>
        </nav>
      </div>
      <div className="flex flex-col p-6">
        <div className="flex justify-end">
          <Btn variant="outline" size="sm" onClick={toggle}>
            {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}Pasar a{" "}
            {dark ? "claro" : "oscuro"}
          </Btn>
        </div>
        <form onSubmit={submit} className="m-auto w-full max-w-sm space-y-5" noValidate>
          <div>
            <h2 className="text-3xl font-bold">Bienvenido</h2>
            <p className="mt-1 text-sm text-muted-foreground">Ingresa con tu cuenta Piddop.</p>
          </div>
          <Field label="Correo">
            <Input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </Field>
          <Field label="Contraseña">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </Field>
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <Btn type="submit" disabled={isSubmitting || status === "booting"} className="w-full">
            {isSubmitting ? "Entrando..." : "Entrar al panel"}
          </Btn>
        </form>
      </div>
    </div>
  );
}
