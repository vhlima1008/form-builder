import { Eye } from "lucide-react"
import { useEffect, useState } from "react"

import { ErrorState } from "@/components/common/ErrorState"
import { LoadingState } from "@/components/common/LoadingState"
import { ResponseDetails } from "@/components/responses/ResponseDetails"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDate } from "@/lib/format"
import { ownerResponseService } from "@/services/response-service"
import type { Form } from "@/types/form"
import type { FormResponseDetails, FormResponseSummary } from "@/types/response"

export function FormResponsesDetailReport({ forms }: { forms: Form[] }) {
  const publishedForms = forms.filter((form) => form.published)

  const [formId, setFormId] = useState<string>(publishedForms[0]?.id ?? "")
  const [responses, setResponses] = useState<FormResponseSummary[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<unknown>(null)

  const [selectedResponse, setSelectedResponse] =
    useState<FormResponseDetails | null>(null)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [detailsError, setDetailsError] = useState<unknown>(null)
  const [openResponseId, setOpenResponseId] = useState<string | null>(null)

  useEffect(() => {
    if (!formId) {
      setResponses([])
      return
    }
    async function loadResponses(currentFormId: string) {
      setIsLoading(true)
      setError(null)
      try {
        setResponses(await ownerResponseService.getFormResponses(currentFormId))
      } catch (requestError) {
        setError(requestError)
      } finally {
        setIsLoading(false)
      }
    }
    void loadResponses(formId)
  }, [formId])

  async function handleViewDetails(responseId: string) {
    if (!formId) return
    setOpenResponseId(responseId)
    setSelectedResponse(null)
    setDetailsError(null)
    setIsLoadingDetails(true)
    try {
      setSelectedResponse(
        await ownerResponseService.getFormResponseDetails(formId, responseId)
      )
    } catch (requestError) {
      setDetailsError(requestError)
    } finally {
      setIsLoadingDetails(false)
    }
  }

  return (
    <div className="grid gap-4">
      <p className="text-sm text-muted-foreground">
        Selecione um formulário publicado para ver quantas respostas ele
        recebeu e abrir cada uma delas com as respostas detalhadas por
        pergunta.
      </p>

      {publishedForms.length === 0 ? (
        <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
          Você ainda não tem nenhum formulário publicado.
        </p>
      ) : (
        <>
          <div className="grid gap-1 sm:w-72">
            <label className="text-xs text-muted-foreground" htmlFor="detail-form">
              Formulário publicado
            </label>
            <Select value={formId} onValueChange={setFormId}>
              <SelectTrigger id="detail-form" className="w-full">
                <SelectValue placeholder="Selecione um formulário" />
              </SelectTrigger>
              <SelectContent>
                {publishedForms.map((form) => (
                  <SelectItem key={form.id} value={form.id}>
                    {form.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? <LoadingState label="Carregando respostas recebidas…" /> : null}
          {error ? <ErrorState error={error} /> : null}

          {!isLoading && !error ? (
            <p className="text-sm text-muted-foreground">
              {responses.length} resposta{responses.length === 1 ? "" : "s"}{" "}
              recebida{responses.length === 1 ? "" : "s"} por este formulário.
            </p>
          ) : null}

          {!isLoading && !error && responses.length > 0 ? (
            <div className="overflow-hidden rounded-xl border bg-background shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Respondente</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Recebida em</TableHead>
                    <TableHead className="text-right">Respostas detalhadas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {responses.map((response) => (
                    <TableRow key={response.id}>
                      <TableCell className="font-medium">
                        {response.respondentName || "Pessoa externa"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            response.status === "FINISHED"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {response.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(response.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={() => handleViewDetails(response.id)}
                        >
                          <Eye className="size-4" aria-hidden="true" />
                          Ver respostas
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : null}
        </>
      )}

      <Dialog
        open={openResponseId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setOpenResponseId(null)
            setSelectedResponse(null)
            setDetailsError(null)
          }
        }}
      >
        <DialogContent className="max-h-[85vh] w-full max-w-2xl overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Respostas detalhadas</DialogTitle>
            <DialogDescription>
              Valor informado pelo respondente em cada pergunta do formulário.
            </DialogDescription>
          </DialogHeader>
          {isLoadingDetails ? (
            <LoadingState label="Carregando respostas detalhadas…" />
          ) : null}
          {detailsError ? <ErrorState error={detailsError} /> : null}
          {!isLoadingDetails && !detailsError && selectedResponse ? (
            <ResponseDetails response={selectedResponse} />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
