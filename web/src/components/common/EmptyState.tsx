import { Inbox } from "lucide-react"
import type { ReactNode } from "react"

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string
  description: string
  action?: ReactNode
  icon?: ReactNode
}) {
  return (
    <div className="rounded-2xl border border-dashed bg-card/80 p-8 text-center shadow-xs">
      <div className="mx-auto mb-4 flex size-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
        {icon ?? <Inbox className="size-5" aria-hidden="true" />}
      </div>
      <h2 className="text-base font-semibold text-pretty">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-pretty text-muted-foreground">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}
