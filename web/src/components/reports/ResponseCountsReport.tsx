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
import { reportService } from "@/services/report-service"
import type { FormResponseCount } from "@/types/report"

export function ResponseCountsReport() {
  const [counts, setCounts] = useState<FormResponseCount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        setCounts(await reportService.getResponseCounts())
      } catch (requestError) {
        setError(requestError)
      } finally {
        setIsLoading(false)
      }
    }
    void load()
  }, [])

  if (isLoading) return <LoadingState label="Calculando respostas por formulário…" />
  if (error) return <ErrorState error={error} />

  if (counts.length === 0) {
    return (
      <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
        Nenhum formulário publicado com respostas finalizadas ainda.
      </p>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-background shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Formulário</TableHead>
            <TableHead className="text-right">Respostas finalizadas</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {counts.map((row) => (
            <TableRow key={row.formId}>
              <TableCell className="font-medium">{row.formTitle}</TableCell>
              <TableCell className="text-right">{row.totalResponses}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
