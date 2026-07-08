import { FileText, LogOut, Plus } from "lucide-react"
import { Link, NavLink } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"

export function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link to="/dashboard" className="flex items-center gap-2 font-semibold">
          <span className="flex size-8 items-center justify-center rounded-lg border bg-muted/40">
            <FileText className="size-4" aria-hidden="true" />
          </span>
          Forms
        </Link>
        <nav className="hidden items-center gap-2 sm:flex">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `rounded-md px-3 py-2 text-sm ${isActive ? "bg-muted" : "text-muted-foreground"}`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/forms"
            className={({ isActive }) =>
              `rounded-md px-3 py-2 text-sm ${isActive ? "bg-muted" : "text-muted-foreground"}`
            }
          >
            Formulários
          </NavLink>
          <NavLink
            to="/reports"
            className={({ isActive }) =>
              `rounded-md px-3 py-2 text-sm ${isActive ? "bg-muted" : "text-muted-foreground"}`
            }
          >
            Relatórios
          </NavLink>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild size="sm">
            <Link to="/forms/new">
              <Plus className="size-4" aria-hidden="true" />
              Novo
            </Link>
          </Button>
          <span className="hidden max-w-36 truncate text-sm text-muted-foreground md:inline">
            {user?.name}
          </span>
          <Button
            aria-label="Sair"
            variant="ghost"
            size="icon"
            type="button"
            onClick={logout}
          >
            <LogOut className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </header>
  )
}
