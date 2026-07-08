import { Outlet } from "react-router-dom"

export function PublicFormLayout() {
  return (
    <main className="min-h-svh bg-background px-4 py-6">
      <Outlet />
    </main>
  )
}
