import { useState } from "react"

import { ErrorState } from "@/components/common/ErrorState"
import { LoadingState } from "@/components/common/LoadingState"
import {
  FormPeriodSearchForm,
  type PeriodSearchValue,
} from "@/components/reports/FormPeriodSearchForm"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDate } from "@/lib/format"
import { reportService } from "@/services/report-service"
import type { Form } from "@/types/form"
import type { OwnerFormResponse } from "@/types/report"

export function ResponsesInPeriodReport({ forms }: { forms: Form[] }) {
  const [responses, setResponses] = useState<OwnerFormResponse[] | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<unknown>(null)

  async function handleSearch({ formId, start, end }: PeriodSearchValue) {
    setIsSearching(true)
    setError(null)
    try {
      setResponses(await reportService.getResponsesInPeriod(formId, start, end))
    } catch (requestError) {
      setError(requestError)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="grid gap-4">
      <p className="text-sm text-muted-foreground">
        Consulta com INNER JOIN entre formulários e respostas, filtrando por
        um período informado.
      </p>
      <FormPeriodSearchForm
        forms={forms}
        onSearch={handleSearch}
        isSearching={isSearching}
      />
      {isSearching ? <LoadingState label="Buscando respostas no período…" /> : null}
      {error ? <ErrorState error={error} /> : null}
      {!isSearching && !error && responses !== null ? (
        responses.length === 0 ? (
          <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            Nenhuma resposta encontrada nesse período.
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border bg-background shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Respondente</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Recebida em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {responses.map((response) => (
                  <TableRow key={response.id}>
                    <TableCell className="font-medium">
                      {response.respondentName || "Pessoa externa"}
                    </TableCell>
                    <TableCell>{response.respondentEmail || "-"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          response.status === "FINISHED" ? "default" : "secondary"
                        }
                      >
                        {response.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(response.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )
      ) : null}
    </div>
  )
}
