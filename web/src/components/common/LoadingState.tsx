import { Skeleton } from "@/components/ui/skeleton"

export function LoadingState({
  label = "Carregando…",
  rows = 2,
}: {
  label?: string
  rows?: number
}) {
  return (
    <div className="grid gap-3" aria-live="polite" aria-busy="true">
      <p className="text-sm text-muted-foreground">{label}</p>
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className="h-24 w-full rounded-2xl" />
      ))}
    </div>
  )
}
