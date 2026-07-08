import { Navigate, createBrowserRouter } from "react-router-dom"

import { AppLayout } from "@/components/layout/AppLayout"
import { AuthLayout } from "@/components/layout/AuthLayout"
import { PublicFormLayout } from "@/components/layout/PublicFormLayout"
import { useAuth } from "@/hooks/useAuth"
import { LoginPage } from "@/pages/auth/LoginPage"
import { RegisterPage } from "@/pages/auth/RegisterPage"
import { DashboardPage } from "@/pages/dashboard/DashboardPage"
import { FormBuilderPage } from "@/pages/dashboard/FormBuilderPage"
import { FormResponseDetailsPage } from "@/pages/dashboard/FormResponseDetailsPage"
import { FormResponsesPage } from "@/pages/dashboard/FormResponsesPage"
import { FormsPage } from "@/pages/dashboard/FormsPage"
import { NewFormPage } from "@/pages/dashboard/NewFormPage"
import { ReportsPage } from "@/pages/dashboard/ReportsPage"
import { PublicFormPage } from "@/pages/public/PublicFormPage"
import { PublicFormSubmittedPage } from "@/pages/public/PublicFormSubmittedPage"

function ProtectedRoute() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <AppLayout /> : <Navigate to="/login" replace />
}

function PublicOnlyRoute() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <AuthLayout />
}

export const router = createBrowserRouter([
  {
    element: <PublicOnlyRoute />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      { path: "/dashboard", element: <DashboardPage /> },
      { path: "/forms", element: <FormsPage /> },
      { path: "/reports", element: <ReportsPage /> },
      { path: "/forms/new", element: <NewFormPage /> },
      { path: "/forms/:formId/builder", element: <FormBuilderPage /> },
      { path: "/forms/:formId/responses", element: <FormResponsesPage /> },
      {
        path: "/forms/:formId/responses/:responseId",
        element: <FormResponseDetailsPage />,
      },
    ],
  },
  {
    element: <PublicFormLayout />,
    children: [
      { path: "/forms/public/:publicSlug", element: <PublicFormPage /> },
      {
        path: "/forms/public/:publicSlug/submitted",
        element: <PublicFormSubmittedPage />,
      },
    ],
  },
  { path: "*", element: <Navigate to="/dashboard" replace /> },
])
