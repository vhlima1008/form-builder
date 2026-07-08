import { Outlet } from "react-router-dom"

import { Header } from "@/components/layout/Header"

export function AppLayout() {
  return (
    <div className="min-h-svh bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  )
}
