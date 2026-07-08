import { EmptyState } from "@/components/common/EmptyState"
import { ErrorState } from "@/components/common/ErrorState"
import { LoadingState } from "@/components/common/LoadingState"
import { PageHeader } from "@/components/common/PageHeader"
import { FormResponsesDetailReport } from "@/components/reports/FormResponsesDetailReport"
import { QuestionsWithoutAnswersReport } from "@/components/reports/QuestionsWithoutAnswersReport"
import { ResponseCountsReport } from "@/components/reports/ResponseCountsReport"
import { ResponsesInPeriodReport } from "@/components/reports/ResponsesInPeriodReport"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useForms } from "@/hooks/useForms"

export function ReportsPage() {
  const { forms, isLoading, error } = useForms()

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Relatórios"
        description="Consultas que cruzam dados de mais de uma tabela: agregações, filtros por período e perguntas ainda sem resposta."
      />

      {isLoading ? <LoadingState label="Carregando seus formulários…" /> : null}
      {error ? <ErrorState error={error} /> : null}

      {!isLoading && !error && forms.length === 0 ? (
        <EmptyState
          title="Nenhum formulário para gerar relatórios"
          description="Crie e publique um formulário para visualizar consultas e relatórios sobre as respostas recebidas."
        />
      ) : null}

      {!isLoading && !error && forms.length > 0 ? (
        <Tabs defaultValue="details">
          <TabsList>
            <TabsTrigger value="details">Respostas recebidas</TabsTrigger>
            <TabsTrigger value="counts">Respostas por formulário</TabsTrigger>
            <TabsTrigger value="period">Respostas por período</TabsTrigger>
            <TabsTrigger value="pending">Perguntas sem resposta</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="mt-4">
            <FormResponsesDetailReport forms={forms} />
          </TabsContent>
          <TabsContent value="counts" className="mt-4">
            <ResponseCountsReport />
          </TabsContent>
          <TabsContent value="period" className="mt-4">
            <ResponsesInPeriodReport forms={forms} />
          </TabsContent>
          <TabsContent value="pending" className="mt-4">
            <QuestionsWithoutAnswersReport forms={forms} />
          </TabsContent>
        </Tabs>
      ) : null}
    </div>
  )
}
