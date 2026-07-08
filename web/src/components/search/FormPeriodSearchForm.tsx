import { Search } from "lucide-react"
import { useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Form } from "@/types/form"

export type PeriodSearchValue = {
  formId: string
  start: string
  end: string
}

export function FormPeriodSearchForm({
  forms,
  onSearch,
  isSearching,
}: {
  forms: Form[]
  onSearch: (value: PeriodSearchValue) => void
  isSearching?: boolean
}) {
  const [formId, setFormId] = useState<string>(forms[0]?.id ?? "")
  const [start, setStart] = useState("2026-01-01T00:00")
  const [end, setEnd] = useState("2026-12-31T23:59")

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!formId) return
    onSearch({ formId, start, end })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-xl border bg-card/70 p-4 sm:flex-row sm:items-end sm:flex-wrap"
    >
      <div className="grid gap-1">
        <label className="text-xs text-muted-foreground" htmlFor="period-form">
          Formulário
        </label>
        <Select value={formId} onValueChange={setFormId}>
          <SelectTrigger id="period-form" className="w-full sm:w-56">
            <SelectValue placeholder="Selecione um formulário" />
          </SelectTrigger>
          <SelectContent>
            {forms.map((form) => (
              <SelectItem key={form.id} value={form.id}>
                {form.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-1">
        <label className="text-xs text-muted-foreground" htmlFor="period-start">
          De
        </label>
        <input
          id="period-start"
          type="datetime-local"
          value={start}
          onChange={(event) => setStart(event.target.value)}
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>
      <div className="grid gap-1">
        <label className="text-xs text-muted-foreground" htmlFor="period-end">
          Até
        </label>
        <input
          id="period-end"
          type="datetime-local"
          value={end}
          onChange={(event) => setEnd(event.target.value)}
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>
      <Button type="submit" disabled={!formId || isSearching}>
        <Search className="size-4" aria-hidden="true" />
        Pesquisar
      </Button>
    </form>
  )
}
