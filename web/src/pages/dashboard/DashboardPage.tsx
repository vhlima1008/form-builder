import { FileText, Plus } from "lucide-react"
import { useMemo, type ReactNode } from "react"
import { Link } from "react-router-dom"

import { EmptyState } from "@/components/common/EmptyState"
import { ErrorState } from "@/components/common/ErrorState"
import { LoadingState } from "@/components/common/LoadingState"
import { PageHeader } from "@/components/common/PageHeader"
import { FormCard } from "@/components/forms/FormCard"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/hooks/useAuth"
import { useForms } from "@/hooks/useForms"

export function DashboardPage() {
  const { user } = useAuth()
  const { forms, isLoading, error, loadForms } = useForms()
  const { draftCount, publishedCount, recentForms } = useMemo(
    () => ({
      draftCount: forms.filter((form) => !form.published).length,
      publishedCount: forms.filter((form) => form.published).length,
      recentForms: forms.slice(0, 3),
    }),
    [forms]
  )

  return (
    <div className="grid gap-6">
      <PageHeader
        title={`Olá, ${user?.name || "bem-vindo"}`}
        description="Gerencie seus formulários, publique links e acompanhe respostas recebidas."
        action={
          <Button asChild>
            <Link to="/forms/new">
              <Plus className="size-4" aria-hidden="true" />
              Novo formulário
            </Link>
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard label="Total" value={forms.length} icon={<FileText />} />
        <MetricCard label="Publicados" value={publishedCount} />
        <MetricCard label="Rascunhos" value={draftCount} />
      </div>

      {isLoading ? <LoadingState label="Carregando formulários…" /> : null}
      {error ? <ErrorState error={error} /> : null}
      {!isLoading && !error && recentForms.length === 0 ? (
        <EmptyState
          title="Nenhum formulário ainda"
          description="Crie seu primeiro formulário para começar a coletar respostas."
          action={
            <Button asChild>
              <Link to="/forms/new">Criar formulário</Link>
            </Button>
          }
        />
      ) : null}
      {!isLoading && !error && recentForms.length > 0 ? (
        <section className="grid gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Recentes</h2>
            <Button asChild variant="outline" size="sm">
              <Link to="/forms">Ver todos</Link>
            </Button>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {recentForms.map((form) => (
              <FormCard key={form.id} form={form} onChanged={loadForms} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string
  value: number
  icon?: ReactNode
}) {
  return (
    <Card className="bg-card shadow-xs">
      <CardContent className="flex items-center justify-between gap-4 p-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight">{value}</p>
        </div>
        {icon ? (
          <div className="flex size-10 items-center justify-center rounded-full bg-accent text-accent-foreground [&_svg]:size-5">
            {icon}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
