import { createFileRoute, Link } from "@tanstack/react-router";

const pages = {
  terminos: {
    title: "Términos y condiciones",
    body: "Consulta aquí las condiciones de uso del servicio Piddop.",
  },
  privacidad: {
    title: "Política de privacidad",
    body: "Conoce cómo protegemos y tratamos tus datos personales.",
  },
  datos: {
    title: "Autorización de datos",
    body: "Revisa la autorización para el tratamiento de datos personales.",
  },
  "eliminar-cuenta": {
    title: "Eliminar cuenta",
    body: "Puedes solicitar la eliminación de tu cuenta desde la aplicación o por medio de soporte.",
  },
  soporte: {
    title: "Soporte",
    body: "Para recibir ayuda con tu cuenta o el servicio, contáctanos por los canales oficiales de Piddop.",
  },
} as const;

export const Route = createFileRoute("/legal/$page")({ component: LegalPage });

function LegalPage() {
  const { page } = Route.useParams();
  const content = pages[page as keyof typeof pages] ?? {
    title: "Página no disponible",
    body: "El contenido solicitado no existe.",
  };
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <article className="w-full max-w-2xl rounded-2xl border border-border bg-card p-8 shadow-card">
        <Link to="/" className="text-sm font-medium text-primary">
          ← Volver al ingreso
        </Link>
        <h1 className="mt-6 text-3xl font-bold">{content.title}</h1>
        <p className="mt-3 text-muted-foreground">{content.body}</p>
      </article>
    </main>
  );
}
