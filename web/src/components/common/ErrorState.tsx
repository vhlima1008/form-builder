import { AlertCircle } from "lucide-react"
import type { ReactNode } from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getApiErrorMessage } from "@/lib/api"

export function ErrorState({
  error,
  action,
  title = "Não foi possível carregar as informações",
}: {
  error: unknown
  action?: ReactNode
  title?: string
}) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="size-4" aria-hidden="true" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="space-y-3">
        <p>{getApiErrorMessage(error)}</p>
        {action}
      </AlertDescription>
    </Alert>
  )
}
