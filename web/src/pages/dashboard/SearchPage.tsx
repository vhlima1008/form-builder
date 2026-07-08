import { BarChart3, ListFilter, Search } from "lucide-react"
import { useMemo, useState } from "react"

import { EmptyState } from "@/components/common/EmptyState"
import { ErrorState } from "@/components/common/ErrorState"
import { LoadingState } from "@/components/common/LoadingState"
import { PageHeader } from "@/components/common/PageHeader"
import { FormCompletenessSearch } from "@/components/search/FormCompletenessSearch"
import { FormResponsesDetailSearch } from "@/components/search/FormResponsesDetailSearch"
import { QuestionsWithoutAnswersSearch } from "@/components/search/QuestionsWithoutAnswersSearch"
import { ResponseCountsSearch } from "@/components/search/ResponseCountsSearch"
import { ResponsesInPeriodSearch } from "@/components/search/ResponsesInPeriodSearch"
import { UsersWithPublishedFormsSearch } from "@/components/search/UsersWithPublishedFormsSearch"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useForms } from "@/hooks/useForms"

type SearchType =
  | "details"
  | "counts"
  | "period"
  | "pending"
  | "complete"
  | "published"

const searchOptions: Array<{
  value: SearchType
  label: string
  description: string
}> = [
  {
    value: "details",
    label: "Respostas recebidas",
    description: "Abra respostas de um formulário publicado e consulte cada envio.",
  },
  {
    value: "counts",
    label: "Respostas por formulário",
    description: "Compare formulários publicados por volume de respostas finalizadas.",
  },
  {
    value: "period",
    label: "Respostas por período",
    description: "Filtre respostas recebidas em uma janela de datas.",
  },
  {
    value: "pending",
    label: "Perguntas sem resposta",
    description: "Encontre perguntas que ainda não receberam respostas no período.",
  },
  {
    value: "complete",
    label: "Formulários completos",
    description: "Identifique formulários publicados com estrutura mais completa.",
  },
  {
    value: "published",
    label: "Publicações ativas",
    description: "Veja a conta com formulários publicados disponíveis para coleta.",
  },
]

export function SearchPage() {
  const { forms, isLoading, error } = useForms()
  const [selectedType, setSelectedType] = useState<SearchType>("details")
  const [activeType, setActiveType] = useState<SearchType | null>(null)

  const selectedOption = useMemo(
    () => searchOptions.find((option) => option.value === selectedType),
    [selectedType]
  )

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Busca avançada"
        description="Encontre respostas, formulários e pendências usando filtros específicos para acompanhar seus resultados."
      />

      {isLoading ? <LoadingState label="Carregando seus formulários…" /> : null}
      {error ? <ErrorState error={error} /> : null}

      {!isLoading && !error && forms.length === 0 ? (
        <EmptyState
          title="Nenhum formulário disponível"
          description="Crie um formulário para acompanhar respostas, pendências e indicadores de publicação."
        />
      ) : null}

      {!isLoading && !error && forms.length > 0 ? (
        <div className="grid gap-4">
          <Card className="bg-card shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <ListFilter className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <CardTitle>Escolha o tipo de busca</CardTitle>
                  <CardDescription>
                    Selecione um filtro e execute apenas a consulta necessária.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                <div className="grid gap-2">
                  <label
                    className="text-sm font-medium"
                    htmlFor="search-type"
                  >
                    Tipo de resultado
                  </label>
                  <Select
                    value={selectedType}
                    onValueChange={(value) => {
                      setSelectedType(value as SearchType)
                    }}
                  >
                    <SelectTrigger id="search-type" className="h-10">
                      <SelectValue placeholder="Selecione uma busca" />
                    </SelectTrigger>
                    <SelectContent>
                      {searchOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedOption ? (
                    <p className="text-sm text-muted-foreground">
                      {selectedOption.description}
                    </p>
                  ) : null}
                </div>
                <Button
                  type="button"
                  onClick={() => setActiveType(selectedType)}
                >
                  <Search className="size-4" aria-hidden="true" />
                  Buscar
                </Button>
              </div>
            </CardContent>
          </Card>

          {activeType ? (
            <section className="animate-in fade-in-0 slide-in-from-bottom-2 duration-200">
              {renderSearchResult(activeType, forms)}
            </section>
          ) : (
            <EmptyState
              icon={<BarChart3 className="size-5" aria-hidden="true" />}
              title="Nenhum filtro executado"
              description="Escolha o tipo de resultado e clique em Buscar para carregar as informações."
            />
          )}
        </div>
      ) : null}
    </div>
  )
}

function renderSearchResult(type: SearchType, forms: ReturnType<typeof useForms>["forms"]) {
  if (type === "details") return <FormResponsesDetailSearch forms={forms} />
  if (type === "counts") return <ResponseCountsSearch />
  if (type === "period") return <ResponsesInPeriodSearch forms={forms} />
  if (type === "pending") return <QuestionsWithoutAnswersSearch forms={forms} />
  if (type === "complete") return <FormCompletenessSearch />
  return <UsersWithPublishedFormsSearch />
}
