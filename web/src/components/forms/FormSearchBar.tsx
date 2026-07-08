import { Search, X } from "lucide-react"
import type { FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type FormSearchFilters = {
  title: string
  published?: boolean
}

export function FormSearchBar({
  filters,
  onChange,
  onClear,
}: {
  filters: FormSearchFilters
  onChange: (filters: FormSearchFilters) => void
  onClear: () => void
}) {
  const status =
    filters.published === undefined
      ? "all"
      : filters.published
        ? "published"
        : "draft"

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
  }

  function handleClear() {
    onClear()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-xs sm:flex-row sm:items-center"
    >
      <div className="flex-1">
        <Input
          placeholder="Pesquisar por título…"
          value={filters.title}
          onChange={(event) =>
            onChange({ ...filters, title: event.target.value })
          }
          aria-label="Pesquisar formulários por título"
        />
      </div>
      <Select
        value={status}
        onValueChange={(value) =>
          onChange({
            ...filters,
            published:
              value === "all" ? undefined : value === "published",
          })
        }
      >
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os status</SelectItem>
          <SelectItem value="published">Publicados</SelectItem>
          <SelectItem value="draft">Rascunhos</SelectItem>
        </SelectContent>
      </Select>
      <div className="flex gap-2">
        <Button type="submit" variant="secondary">
          <Search className="size-4" aria-hidden="true" />
          Filtrar
        </Button>
        <Button type="button" variant="ghost" onClick={handleClear}>
          <X className="size-4" aria-hidden="true" />
          Limpar
        </Button>
      </div>
    </form>
  )
}
