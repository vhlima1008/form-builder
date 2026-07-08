import { Search, X } from "lucide-react"
import { useState, type FormEvent } from "react"

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
  onSearch,
  onClear,
  isSearching,
}: {
  onSearch: (filters: FormSearchFilters) => void
  onClear: () => void
  isSearching?: boolean
}) {
  const [title, setTitle] = useState("")
  const [status, setStatus] = useState<"all" | "published" | "draft">("all")

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    onSearch({
      title,
      published:
        status === "all" ? undefined : status === "published",
    })
  }

  function handleClear() {
    setTitle("")
    setStatus("all")
    onClear()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-xl border bg-card/70 p-4 sm:flex-row sm:items-center"
    >
      <div className="flex-1">
        <Input
          placeholder="Pesquisar por título…"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          aria-label="Pesquisar formulários por título"
        />
      </div>
      <Select
        value={status}
        onValueChange={(value) => setStatus(value as typeof status)}
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
        <Button type="submit" disabled={isSearching}>
          <Search className="size-4" aria-hidden="true" />
          Pesquisar
        </Button>
        <Button type="button" variant="ghost" onClick={handleClear}>
          <X className="size-4" aria-hidden="true" />
          Limpar
        </Button>
      </div>
    </form>
  )
}
