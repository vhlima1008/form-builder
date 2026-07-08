import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Eye, FileBarChart, Loader2, Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { Link, useParams } from "react-router-dom"
import { toast } from "sonner"

import { EmptyState } from "@/components/common/EmptyState"
import { ErrorState } from "@/components/common/ErrorState"
import { LoadingState } from "@/components/common/LoadingState"
import { CopyPublicLinkButton } from "@/components/forms/CopyPublicLinkButton"
import { FormEditor } from "@/components/forms/FormEditor"
import { FormStatusBadge } from "@/components/forms/FormStatusBadge"
import { SectionEditor } from "@/components/forms/SectionEditor"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useFormBuilder } from "@/hooks/useFormBuilder"
import { getApiErrorMessage } from "@/lib/api"
import { sortByPosition } from "@/lib/format"
import {
  questionOptionSchema,
  questionSchema,
  sectionSchema,
  type QuestionOptionValues,
  type QuestionValues,
  type SectionValues,
} from "@/schemas/forms"
import { formService } from "@/services/form-service"
import { questionOptionService } from "@/services/question-option-service"
import { questionService } from "@/services/question-service"
import { sectionService } from "@/services/section-service"
import type { QuestionOption } from "@/types/option"
import type { Question } from "@/types/question"
import type { Section } from "@/types/section"

type DialogMode = "create" | "edit"
type DeleteTarget =
  | { type: "section"; section: Section }
  | { type: "question"; question: Question }
  | { type: "option"; option: QuestionOption }

export function FormBuilderPage() {
  const { formId } = useParams()
  const { form, isLoading, error, loadForm } = useFormBuilder(formId)
  const [sectionDialog, setSectionDialog] = useState<{
    mode: DialogMode
    section?: Section
  } | null>(null)
  const [questionDialog, setQuestionDialog] = useState<{
    mode: DialogMode
    section?: Section
    question?: Question
  } | null>(null)
  const [optionDialog, setOptionDialog] = useState<{
    mode: DialogMode
    question: Question
    option?: QuestionOption
  } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  async function togglePublish() {
    if (!form) return
    try {
      if (form.published) {
        await formService.unpublishForm(form.id)
        toast.success("Formulário despublicado.")
      } else {
        await formService.publishForm(form.id)
        toast.success("Formulário publicado.")
      }
      await loadForm()
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError))
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      if (deleteTarget.type === "section") {
        await sectionService.deleteSection(deleteTarget.section.id)
        toast.success("Seção excluída.")
      } else if (deleteTarget.type === "question") {
        await questionService.deleteQuestion(deleteTarget.question.id)
        toast.success("Pergunta excluída.")
      } else {
        await questionOptionService.deleteOption(deleteTarget.option.id)
        toast.success("Opção excluída.")
      }
      setDeleteTarget(null)
      await loadForm()
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError))
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) return <LoadingState label="Carregando formulário…" />
  if (error) return <ErrorState error={error} />
  if (!form) {
    return (
      <EmptyState
        title="Formulário não encontrado"
        description="Verifique o link informado ou volte para a lista de formulários."
        action={
          <Button asChild variant="outline">
            <Link to="/forms">Voltar aos formulários</Link>
          </Button>
        }
      />
    )
  }

  const sections = sortByPosition(form.sections)

  return (
    <div className="grid gap-6">
      <div className="sticky top-14 z-10 -mx-4 border-b bg-muted/80 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-muted/70">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex min-w-0 items-start gap-3">
            <Button asChild variant="outline" size="icon" className="shrink-0">
              <Link to="/forms" aria-label="Voltar para formulários">
                <ArrowLeft className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-xl font-semibold tracking-tight">
                  {form.title || "Formulário sem título"}
                </h1>
                <FormStatusBadge published={form.published} />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Estruture seções, perguntas e opções antes de publicar.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link to={`/forms/${form.id}/responses`}>
                <FileBarChart className="size-4" aria-hidden="true" />
                Ver respostas
              </Link>
            </Button>
            {form.published && form.publicSlug ? (
              <Button asChild variant="outline">
                <Link to={`/forms/public/${form.publicSlug}`} target="_blank">
                  <Eye className="size-4" aria-hidden="true" />
                  Visualizar
                </Link>
              </Button>
            ) : null}
            {form.published ? (
              <CopyPublicLinkButton publicSlug={form.publicSlug} />
            ) : null}
            <Button type="button" onClick={togglePublish}>
              {form.published ? "Despublicar" : "Publicar formulário"}
            </Button>
          </div>
        </div>
      </div>

      <FormEditor form={form} onSaved={loadForm} />

      <section className="grid gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Estrutura</h2>
            <p className="text-sm text-muted-foreground">
              Organize o formulário em seções e perguntas.
            </p>
          </div>
          <Button
            variant="outline"
            type="button"
            onClick={() => setSectionDialog({ mode: "create" })}
          >
            <Plus className="size-4" aria-hidden="true" />
            Adicionar seção
          </Button>
        </div>
        {sections.length === 0 ? (
          <EmptyState
            title="Nenhuma seção"
            description="Crie uma seção para começar a adicionar perguntas."
            action={
              <Button
                type="button"
                onClick={() => setSectionDialog({ mode: "create" })}
              >
                Adicionar primeira seção
              </Button>
            }
          />
        ) : (
          sections.map((section) => (
            <SectionEditor
              key={section.id}
              section={section}
              onEditSection={(selectedSection) =>
                setSectionDialog({ mode: "edit", section: selectedSection })
              }
              onDeleteSection={(section) =>
                setDeleteTarget({ type: "section", section })
              }
              onAddQuestion={(selectedSection) =>
                setQuestionDialog({ mode: "create", section: selectedSection })
              }
              onEditQuestion={(question) =>
                setQuestionDialog({ mode: "edit", question })
              }
              onDeleteQuestion={(question) =>
                setDeleteTarget({ type: "question", question })
              }
              onAddOption={(question) =>
                setOptionDialog({ mode: "create", question })
              }
              onEditOption={(option, question) =>
                setOptionDialog({ mode: "edit", option, question })
              }
              onDeleteOption={(option) =>
                setDeleteTarget({ type: "option", option })
              }
            />
          ))
        )}
      </section>

      <SectionFormDialog
        formId={form.id}
        state={sectionDialog}
        nextPosition={sections.length + 1}
        onOpenChange={(open) => (open ? null : setSectionDialog(null))}
        onSaved={loadForm}
      />
      <QuestionFormDialog
        state={questionDialog}
        onOpenChange={(open) => (open ? null : setQuestionDialog(null))}
        onSaved={loadForm}
      />
      <OptionFormDialog
        state={optionDialog}
        onOpenChange={(open) => (open ? null : setOptionDialog(null))}
        onSaved={loadForm}
      />
      <DeleteContentDialog
        target={deleteTarget}
        isDeleting={isDeleting}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        onConfirm={confirmDelete}
      />
    </div>
  )
}

function DeleteContentDialog({
  target,
  isDeleting,
  onOpenChange,
  onConfirm,
}: {
  target: DeleteTarget | null
  isDeleting: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}) {
  const label =
    target?.type === "section"
      ? "Excluir seção?"
      : target?.type === "question"
        ? "Excluir pergunta?"
        : "Excluir opção?"

  const description =
    target?.type === "section"
      ? "A seção e suas perguntas serão removidas do formulário."
      : target?.type === "question"
        ? "A pergunta será removida do formulário e deixará de aparecer para respondentes."
        : "A opção será removida desta pergunta."

  return (
    <Dialog open={Boolean(target)} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{label}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
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
            onClick={onConfirm}
          >
            {isDeleting ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : null}
            {isDeleting ? "Excluindo…" : "Excluir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function SectionFormDialog({
  formId,
  state,
  nextPosition,
  onOpenChange,
  onSaved,
}: {
  formId: string
  state: { mode: DialogMode; section?: Section } | null
  nextPosition: number
  onOpenChange: (open: boolean) => void
  onSaved: () => Promise<void>
}) {
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<SectionValues>({
    resolver: zodResolver(sectionSchema),
    defaultValues: { title: "", description: "", position: nextPosition },
  })

  useEffect(() => {
    reset({
      title: state?.section?.title || "",
      description: state?.section?.description || "",
      position: state?.section?.position || nextPosition,
    })
  }, [nextPosition, reset, state])

  async function onSubmit(values: SectionValues) {
    try {
      if (state?.mode === "edit" && state.section) {
        await sectionService.updateSection(state.section.id, values)
        toast.success("Seção atualizada.")
      } else {
        await sectionService.createSection(formId, values)
        toast.success("Seção criada.")
      }
      onOpenChange(false)
      await onSaved()
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  return (
    <Dialog open={Boolean(state)} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {state?.mode === "edit" ? "Editar seção" : "Nova seção"}
          </DialogTitle>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-2">
            <Label htmlFor="section-title">Título</Label>
            <Input
              id="section-title"
              autoComplete="off"
              placeholder="Ex.: Informações pessoais"
              {...register("title")}
            />
            {errors.title ? (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            ) : null}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="section-description">Descrição</Label>
            <Textarea
              id="section-description"
              autoComplete="off"
              placeholder="Explique o objetivo desta seção…"
              {...register("description")}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="section-position">Posição</Label>
            <Input
              id="section-position"
              type="number"
              min="1"
              {...register("position", { valueAsNumber: true })}
            />
          </div>
          <DialogFooter>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : null}
              {isSubmitting ? "Salvando…" : "Salvar seção"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function QuestionFormDialog({
  state,
  onOpenChange,
  onSaved,
}: {
  state: { mode: DialogMode; section?: Section; question?: Question } | null
  onOpenChange: (open: boolean) => void
  onSaved: () => Promise<void>
}) {
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    control,
    register,
    reset,
    setValue,
  } = useForm<QuestionValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "TEXTAREA",
      required: false,
      position: 1,
    },
  })
  const required = useWatch({ control, name: "required" })
  const type = useWatch({ control, name: "type" })

  useEffect(() => {
    reset({
      title: state?.question?.title || "",
      description: state?.question?.description || "",
      type: state?.question?.type || "TEXTAREA",
      required: state?.question?.required || false,
      position:
        state?.question?.position ||
        (state?.section?.questions.length || 0) + 1,
    })
  }, [reset, state])

  async function onSubmit(values: QuestionValues) {
    try {
      if (state?.mode === "edit" && state.question) {
        await questionService.updateQuestion(state.question.id, values)
        toast.success("Pergunta atualizada.")
      } else if (state?.section) {
        await questionService.createQuestion(state.section.id, values)
        toast.success("Pergunta criada.")
      }
      onOpenChange(false)
      await onSaved()
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  return (
    <Dialog open={Boolean(state)} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {state?.mode === "edit" ? "Editar pergunta" : "Nova pergunta"}
          </DialogTitle>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-2">
            <Label htmlFor="question-title">Título</Label>
            <Input
              id="question-title"
              autoComplete="off"
              placeholder="Ex.: Como você avalia a experiência?"
              {...register("title")}
            />
            {errors.title ? (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            ) : null}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="question-description">Descrição</Label>
            <Textarea
              id="question-description"
              autoComplete="off"
              placeholder="Adicione uma orientação opcional…"
              {...register("description")}
            />
          </div>
          <div className="grid gap-2">
            <Label>Tipo</Label>
            <Select
              value={type}
              onValueChange={(value) =>
                setValue("type", value as QuestionValues["type"], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TEXTAREA">Texto longo</SelectItem>
                <SelectItem value="SELECTION">Seleção única</SelectItem>
                <SelectItem value="CHECKBOX">Múltipla escolha</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="question-position">Posição</Label>
            <Input
              id="question-position"
              type="number"
              min="1"
              {...register("position", { valueAsNumber: true })}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={required}
              onCheckedChange={(checked) =>
                setValue("required", checked === true, { shouldValidate: true })
              }
            />
            Pergunta obrigatória
          </label>
          <DialogFooter>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : null}
              {isSubmitting ? "Salvando…" : "Salvar pergunta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function OptionFormDialog({
  state,
  onOpenChange,
  onSaved,
}: {
  state: {
    mode: DialogMode
    question: Question
    option?: QuestionOption
  } | null
  onOpenChange: (open: boolean) => void
  onSaved: () => Promise<void>
}) {
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<QuestionOptionValues>({
    resolver: zodResolver(questionOptionSchema),
    defaultValues: { label: "", value: "", position: 1 },
  })

  useEffect(() => {
    reset({
      label: state?.option?.label || "",
      value: state?.option?.value || "",
      position:
        state?.option?.position || (state?.question.options.length || 0) + 1,
    })
  }, [reset, state])

  async function onSubmit(values: QuestionOptionValues) {
    try {
      if (state?.mode === "edit" && state.option) {
        await questionOptionService.updateOption(state.option.id, values)
        toast.success("Opção atualizada.")
      } else if (state?.question) {
        await questionOptionService.createOption(state.question.id, values)
        toast.success("Opção criada.")
      }
      onOpenChange(false)
      await onSaved()
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  return (
    <Dialog open={Boolean(state)} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {state?.mode === "edit" ? "Editar opção" : "Nova opção"}
          </DialogTitle>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-2">
            <Label htmlFor="option-label">Texto</Label>
            <Input
              id="option-label"
              autoComplete="off"
              placeholder="Ex.: Muito satisfeito"
              {...register("label")}
            />
            {errors.label ? (
              <p className="text-sm text-destructive">{errors.label.message}</p>
            ) : null}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="option-value">Valor</Label>
            <Input
              id="option-value"
              autoComplete="off"
              placeholder="Ex.: muito_satisfeito"
              {...register("value")}
            />
            {errors.value ? (
              <p className="text-sm text-destructive">{errors.value.message}</p>
            ) : null}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="option-position">Posição</Label>
            <Input
              id="option-position"
              type="number"
              min="1"
              {...register("position", { valueAsNumber: true })}
            />
          </div>
          <DialogFooter>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : null}
              {isSubmitting ? "Salvando…" : "Salvar opção"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
