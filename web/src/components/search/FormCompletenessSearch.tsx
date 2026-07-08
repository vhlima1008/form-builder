import { useEffect, useState } from "react"

import { ErrorState } from "@/components/common/ErrorState"
import { LoadingState } from "@/components/common/LoadingState"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { searchService } from "@/services/search-service"
import type { FormQuestionCount } from "@/types/search"

export function FormCompletenessSearch() {
  const [forms, setForms] = useState<FormQuestionCount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        setForms(await searchService.getPublishedFormsMoreCompleteThanDrafts())
      } catch (requestError) {
        setError(requestError)
      } finally {
        setIsLoading(false)
      }
    }
    void load()
  }, [])

  if (isLoading) return <LoadingState label="Analisando estrutura dos formulários…" />
  if (error) return <ErrorState error={error} />

  if (forms.length === 0) {
    return (
      <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
        Nenhum formulário publicado se destaca em quantidade de perguntas em
        relação aos rascunhos atuais.
      </p>
    )
  }

  return (
    <div className="grid gap-4">
      <p className="text-sm text-muted-foreground">
        Identifique formulários publicados com estrutura mais completa que os
        rascunhos atuais.
      </p>
      <div className="overflow-hidden rounded-xl border bg-background shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Formulário</TableHead>
              <TableHead className="text-right">Perguntas</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {forms.map((form) => (
              <TableRow key={form.formId}>
                <TableCell className="font-medium">{form.formTitle}</TableCell>
                <TableCell className="text-right">{form.totalQuestions}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
