import { Loader2 } from "lucide-react"
import { useState, type ReactNode } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function ConfirmDeleteDialog({
  title,
  description,
  isDeleting,
  onConfirm,
  trigger,
}: {
  title: string
  description: string
  isDeleting?: boolean
  onConfirm: () => void | Promise<void>
  trigger: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const isBusy = Boolean(isDeleting || isConfirming)

  async function handleConfirm() {
    setIsConfirming(true)
    try {
      await onConfirm()
      setOpen(false)
    } finally {
      setIsConfirming(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button disabled={isBusy} variant="outline" type="button">
              Cancelar
            </Button>
          </DialogClose>
          <Button
            disabled={isBusy}
            variant="destructive"
            type="button"
            onClick={handleConfirm}
          >
            {isBusy ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : null}
            {isBusy ? "Excluindo…" : "Excluir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
