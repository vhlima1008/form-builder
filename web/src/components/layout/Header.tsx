import {
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  UserRound,
} from "lucide-react"
import { Link, NavLink } from "react-router-dom"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useAuth } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"

const navigationItems = [
  { to: "/dashboard", label: "Início", icon: LayoutDashboard },
  { to: "/forms", label: "Formulários", icon: FileText },
  { to: "/search", label: "Busca", icon: Search },
]

function navLinkClass(isActive: boolean) {
  return cn(
    "inline-flex h-9 items-center gap-2 rounded-full px-3 text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none",
    isActive
      ? "bg-accent text-accent-foreground"
      : "text-muted-foreground hover:bg-muted hover:text-foreground"
  )
}

export function Header() {
  const { user, logout } = useAuth()
  const initials = getInitials(user?.name)

  return (
    <header
      className="sticky top-0 z-20 border-b bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/80"
      style={{ viewTransitionName: "persistent-nav" }}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <Link to="/dashboard" className="flex items-center gap-2 font-semibold">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
            <FileText className="size-4" aria-hidden="true" />
          </span>
          Forms
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
          {navigationItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => navLinkClass(isActive)}
              >
                <Icon className="size-4" aria-hidden="true" />
                {item.label}
              </NavLink>
            )
          })}
        </nav>
        <div className="flex items-center gap-1.5">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                aria-label="Abrir dados da conta"
                variant="ghost"
                size="icon"
                type="button"
                className="rounded-full"
              >
                <span className="flex size-8 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                  {initials || <UserRound className="size-4" aria-hidden="true" />}
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader className="items-center text-center">
                <DialogTitle>{user?.name || "Usuário"}</DialogTitle>
                <DialogDescription>Sua conta conectada</DialogDescription>
              </DialogHeader>
              <div className="grid justify-items-center gap-3 py-2">
                <div className="flex size-16 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground shadow-xs">
                  {initials || <UserRound className="size-6" aria-hidden="true" />}
                </div>
                <p className="max-w-full truncate text-sm text-muted-foreground">
                  {user?.email}
                </p>
              </div>
              <DialogFooter>
                <Button
                  className="w-full"
                  variant="outline"
                  type="button"
                  onClick={logout}
                >
                  <LogOut className="size-4" aria-hidden="true" />
                  Sair
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                aria-label="Abrir navegação"
                className="md:hidden"
                variant="ghost"
                size="icon"
                type="button"
              >
                <Menu className="size-4" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="grid gap-1 px-4" aria-label="Principal">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <SheetClose key={item.to} asChild>
                      <NavLink
                        to={item.to}
                        className={({ isActive }) =>
                          cn(
                            "flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors",
                            isActive
                              ? "bg-accent text-accent-foreground"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          )
                        }
                      >
                        <Icon className="size-4" aria-hidden="true" />
                        {item.label}
                      </NavLink>
                    </SheetClose>
                  )
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

function getInitials(name: string | undefined) {
  if (!name) return ""
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}
