import { FileText } from "lucide-react"
import { Outlet } from "react-router-dom"

export function AuthLayout() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
            <FileText className="size-5" aria-hidden="true" />
          </div>
          <div>
            <span className="text-xl font-semibold tracking-tight">Forms</span>
            <p className="mt-1 text-sm text-muted-foreground">
              Crie formulários, publique links e acompanhe respostas.
            </p>
          </div>
        </div>
        <Outlet />
      </div>
    </main>
  )
}
