import { CheckCircle2 } from "lucide-react"
import { Link, useParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function PublicFormSubmittedPage() {
  const { publicSlug } = useParams()

  return (
    <div className="mx-auto flex min-h-[calc(100svh-3rem)] max-w-xl items-center">
      <Card className="w-full bg-card shadow-xs">
        <CardContent className="grid justify-items-center gap-5 p-8 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-green-50 text-green-700">
            <CheckCircle2 className="size-8" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-balance">
              Resposta enviada com sucesso
            </h1>
            <p className="mt-2 text-sm text-pretty text-muted-foreground">
              O formulário foi finalizado e sua resposta foi registrada.
            </p>
          </div>
          {publicSlug ? (
            <Button asChild variant="outline">
              <Link to={`/forms/public/${publicSlug}`}>
                Voltar ao formulário
              </Link>
            </Button>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
