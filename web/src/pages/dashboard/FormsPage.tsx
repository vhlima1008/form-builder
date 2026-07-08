import { Plus } from "lucide-react"
import { useState } from "react"
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
import { formService } from "@/services/form-service"
import type { Form } from "@/types/form"

export function FormsPage() {
  const { forms, isLoading, error, loadForms } = useForms()

  const [searchResults, setSearchResults] = useState<Form[] | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<unknown>(null)
  const [lastFilters, setLastFilters] = useState<FormSearchFilters | null>(null)

  async function handleSearch(filters: FormSearchFilters) {
    setIsSearching(true)
    setSearchError(null)
    setLastFilters(filters)
    try {
      const results = await formService.searchForms(filters)
      setSearchResults(results)
    } catch (requestError) {
      setSearchError(requestError)
    } finally {
      setIsSearching(false)
    }
  }

  function handleClearSearch() {
    setSearchResults(null)
    setSearchError(null)
    setLastFilters(null)
  }

  const isShowingSearch = searchResults !== null
  const visibleForms = isShowingSearch ? searchResults : forms

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
        onSearch={handleSearch}
        onClear={handleClearSearch}
        isSearching={isSearching}
      />

      {isShowingSearch ? (
        <p className="text-sm text-muted-foreground">
          {searchResults.length} formulário{searchResults.length === 1 ? "" : "s"}{" "}
          encontrado{searchResults.length === 1 ? "" : "s"} para a pesquisa.
        </p>
      ) : null}

      {isSearching ? <LoadingState label="Pesquisando formulários…" /> : null}
      {searchError ? <ErrorState error={searchError} /> : null}
      {!isShowingSearch && isLoading ? (
        <LoadingState label="Carregando formulários…" />
      ) : null}
      {!isShowingSearch && error ? <ErrorState error={error} /> : null}

      {!isSearching && !searchError && !isLoading && !error && visibleForms.length === 0 ? (
        <EmptyState
          title="Nenhum formulário encontrado"
          description={
            isShowingSearch
              ? "Ajuste os filtros de pesquisa e tente novamente."
              : "Crie um formulário para organizar perguntas em seções e receber respostas."
          }
          action={
            isShowingSearch ? undefined : (
              <Button asChild>
                <Link to="/forms/new">Criar formulário</Link>
              </Button>
            )
          }
        />
      ) : null}

      {!isSearching && !searchError && !isLoading && !error && visibleForms.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {visibleForms.map((form) => (
            <FormCard
              key={form.id}
              form={form}
              onChanged={
                isShowingSearch && lastFilters
                  ? () => handleSearch(lastFilters)
                  : loadForms
              }
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
