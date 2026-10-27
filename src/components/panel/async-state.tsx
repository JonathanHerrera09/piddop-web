import { LoaderCircle, RefreshCw, TriangleAlert } from "lucide-react";
import { Btn, Card } from "@/components/panel/kit";

export function LoadingState({ label = "Cargando información..." }: { label?: string }) {
  return (
    <Card className="flex min-h-48 flex-col items-center justify-center gap-3 text-center">
      <LoaderCircle className="size-6 animate-spin text-primary" aria-hidden="true" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </Card>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Card className="flex min-h-48 flex-col items-center justify-center gap-3 text-center">
      <TriangleAlert className="size-7 text-destructive" aria-hidden="true" />
      <div>
        <p className="font-semibold">No pudimos cargar esta información</p>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">{message}</p>
      </div>
      {onRetry ? (
        <Btn variant="outline" onClick={onRetry}>
          <RefreshCw className="size-4" />
          Reintentar
        </Btn>
      ) : null}
    </Card>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <Card className="flex min-h-48 flex-col items-center justify-center text-center">
      <p className="font-semibold">{title}</p>
      {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
    </Card>
  );
}
