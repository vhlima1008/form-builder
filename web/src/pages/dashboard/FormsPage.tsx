import { Plus } from "lucide-react"
import { useMemo, useState } from "react"
import { Link } from "react-router-dom"

import { EmptyState } from "@/components/common/EmptyState"
import { ErrorState } from "@/components/common/ErrorState"
import { LoadingState } from "@/components/common/LoadingState"
import { PageHeader } from "@/components/common/PageHeader"
import { FormCard } from "@/components/forms/FormCard"
import {
  FormSearchBar,
  type FormSearchFilters,
} from "@/components/forms/FormSearchBar"
import { Button } from "@/components/ui/button"
import { useForms } from "@/hooks/useForms"

export function FormsPage() {
  const { forms, isLoading, error, loadForms } = useForms()

  const [filters, setFilters] = useState<FormSearchFilters>({
    title: "",
    published: undefined,
  })

  const visibleForms = useMemo(() => {
    const normalizedTitle = filters.title.trim().toLowerCase()
    return forms.filter((form) => {
      const matchesTitle =
        normalizedTitle.length === 0 ||
        form.title.toLowerCase().includes(normalizedTitle)
      const matchesStatus =
        filters.published === undefined || form.published === filters.published
      return matchesTitle && matchesStatus
    })
  }, [filters.published, filters.title, forms])

  const isFiltering =
    filters.title.trim().length > 0 || filters.published !== undefined

  function handleClearSearch() {
    setFilters({ title: "", published: undefined })
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Meus formulários"
        description="Uma visão organizada dos formulários em rascunho e publicados."
        action={
          <Button asChild>
            <Link to="/forms/new">
              <Plus className="size-4" aria-hidden="true" />
              Novo formulário
            </Link>
          </Button>
        }
      />

      <FormSearchBar
        filters={filters}
        onChange={setFilters}
        onClear={handleClearSearch}
      />

      {isFiltering ? (
        <p className="text-sm text-muted-foreground">
          {visibleForms.length} formulário{visibleForms.length === 1 ? "" : "s"}{" "}
          encontrado{visibleForms.length === 1 ? "" : "s"} para a pesquisa.
        </p>
      ) : null}

      {isLoading ? <LoadingState label="Carregando formulários…" /> : null}
      {error ? <ErrorState error={error} /> : null}

      {!isLoading && !error && visibleForms.length === 0 ? (
        <EmptyState
          title="Nenhum formulário encontrado"
          description={
            isFiltering
              ? "Ajuste os filtros de pesquisa e tente novamente."
              : "Crie um formulário para organizar perguntas em seções e receber respostas."
          }
          action={
            isFiltering ? undefined : (
              <Button asChild>
                <Link to="/forms/new">Criar formulário</Link>
              </Button>
            )
          }
        />
      ) : null}

      {!isLoading && !error && visibleForms.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {visibleForms.map((form) => (
            <FormCard
              key={form.id}
              form={form}
              onChanged={loadForms}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
