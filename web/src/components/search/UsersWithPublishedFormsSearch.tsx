import { useEffect, useState } from "react"

import { ErrorState } from "@/components/common/ErrorState"
import { LoadingState } from "@/components/common/LoadingState"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { searchService } from "@/services/search-service"
import type { UserSearchResult } from "@/types/search"

export function UsersWithPublishedFormsSearch() {
  const [users, setUsers] = useState<UserSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        setUsers(await searchService.getUsersWithPublishedForms())
      } catch (requestError) {
        setError(requestError)
      } finally {
        setIsLoading(false)
      }
    }
    void load()
  }, [])

  if (isLoading) return <LoadingState label="Verificando publicações ativas…" />
  if (error) return <ErrorState error={error} />

  if (users.length === 0) {
    return (
      <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
        Nenhuma publicação ativa foi encontrada para sua conta.
      </p>
    )
  }

  return (
    <div className="grid gap-4">
      <p className="text-sm text-muted-foreground">
        Confira os usuários com formulários publicados disponíveis para coleta
        de respostas.
      </p>
      <div className="overflow-hidden rounded-xl border bg-background shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>E-mail</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.userId}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
