import {
  Calendar,
  Copy,
  Edit,
  Eye,
  FileBarChart,
  MoreHorizontal,
  Trash2,
} from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"

import { getPublicFormLink } from "@/components/forms/CopyPublicLinkButton"
import { FormStatusBadge } from "@/components/forms/FormStatusBadge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDate } from "@/lib/format"
import { formService } from "@/services/form-service"
import type { Form } from "@/types/form"

export function FormCard({
  form,
  onChanged,
}: {
  form: Form
  onChanged: () => void
}) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function deleteForm() {
    setIsDeleting(true)
    try {
      await formService.deleteForm(form.id)
      toast.success("Formulário excluído.")
      setIsDeleteOpen(false)
      onChanged()
    } catch {
      toast.error("Não foi possível excluir o formulário.")
    } finally {
      setIsDeleting(false)
    }
  }

  async function copyPublicLink() {
    if (!form.publicSlug) return
    await navigator.clipboard.writeText(getPublicFormLink(form.publicSlug))
    toast.success("Link copiado.")
  }

  async function togglePublish() {
    try {
      if (form.published) {
        await formService.unpublishForm(form.id)
        toast.success("Formulário despublicado.")
      } else {
        await formService.publishForm(form.id)
        toast.success("Formulário publicado.")
      }
      onChanged()
    } catch {
      toast.error("Não foi possível alterar a publicação.")
    }
  }

  return (
    <Card className="group overflow-hidden bg-card shadow-xs transition-colors hover:ring-foreground/15">
      <CardHeader className="gap-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="line-clamp-2 min-w-0 text-base">
            {form.title || "Formulário sem título"}
          </CardTitle>
          <FormStatusBadge published={form.published} />
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {form.description || "Sem descrição"}
        </p>
      </CardHeader>
      <CardContent className="flex items-center gap-2 text-xs text-muted-foreground">
        <Calendar className="size-3.5" aria-hidden="true" />
        Atualizado em {formatDate(form.updatedAt || form.createdAt)}
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-2 border-t bg-muted/20 p-3">
        <div className="flex min-w-0 gap-2">
        <Button asChild size="sm">
          <Link to={`/forms/${form.id}/builder`}>
            <Edit className="size-4" aria-hidden="true" />
            Editar
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link to={`/forms/${form.id}/responses`}>
            <FileBarChart className="size-4" aria-hidden="true" />
            Respostas
          </Link>
        </Button>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              aria-label={`Mais ações para ${form.title || "formulário"}`}
              variant="ghost"
              size="icon-sm"
              type="button"
            >
              <MoreHorizontal className="size-4" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            {form.published && form.publicSlug ? (
              <>
                <DropdownMenuItem asChild>
                  <a
                    href={`/forms/public/${form.publicSlug}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Eye className="size-4" aria-hidden="true" />
                    Visualizar formulário
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={copyPublicLink}>
                  <Copy className="size-4" aria-hidden="true" />
                  Copiar link
                </DropdownMenuItem>
              </>
            ) : null}
            <DropdownMenuItem onSelect={togglePublish}>
              {form.published ? "Despublicar" : "Publicar"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => setIsDeleteOpen(true)}
            >
              <Trash2 className="size-4" aria-hidden="true" />
              Excluir formulário
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir formulário?</DialogTitle>
            <DialogDescription>
              Esta ação removerá o formulário e seus dados associados.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button disabled={isDeleting} variant="outline" type="button">
                Cancelar
              </Button>
            </DialogClose>
            <Button
              disabled={isDeleting}
              variant="destructive"
              type="button"
              onClick={deleteForm}
            >
              {isDeleting ? "Excluindo…" : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
