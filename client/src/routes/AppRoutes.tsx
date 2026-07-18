import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '../layouts/AppLayout'
import { AskQuestionPage } from '../pages/AskQuestionPage'
import { DashboardPage } from '../pages/DashboardPage'
import { DocumentsPage } from '../pages/DocumentsPage'
import { LoginPage } from '../pages/LoginPage'
import { RegisterPage } from '../pages/RegisterPage'
import { ProtectedRoute } from './ProtectedRoute'

function Placeholder({ title }: { title: string }) {
  return <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route
              path="/documents/:documentId/ask"
              element={<AskQuestionPage />}
            />
            <Route
              path="/conversations"
              element={<Placeholder title="Conversations" />}
            />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
