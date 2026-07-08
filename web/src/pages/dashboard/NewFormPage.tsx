import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { PageHeader } from "@/components/common/PageHeader"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { getApiErrorMessage } from "@/lib/api"
import { formSchema, type FormValues } from "@/schemas/forms"
import { formService } from "@/services/form-service"

export function NewFormPage() {
  const navigate = useNavigate()
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "", description: "" },
  })

  async function onSubmit(values: FormValues) {
    try {
      const form = await formService.createForm(values)
      toast.success("Formulário criado.")
      navigate(`/forms/${form.id}/builder`)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  return (
    <div className="mx-auto grid max-w-2xl gap-6">
      <PageHeader
        title="Novo formulário"
        description="Defina o título e a descrição inicial. Você poderá adicionar seções e perguntas na próxima etapa."
        action={
          <Button asChild variant="outline">
            <Link to="/forms">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Voltar
            </Link>
          </Button>
        }
      />
      <Card className="bg-card shadow-xs">
        <CardHeader>
          <CardTitle>Informações principais</CardTitle>
          <CardDescription>
            Estes dados aparecem no topo do formulário público.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                autoComplete="off"
                placeholder="Ex.: Pesquisa de satisfação"
                {...register("title")}
              />
              {errors.title ? (
                <p className="text-sm text-destructive">
                  {errors.title.message}
                </p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                rows={4}
                placeholder="Explique rapidamente o objetivo do formulário."
                {...register("description")}
              />
            </div>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              Criar e editar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
