import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppLayout } from '../layouts/AppLayout'
import { AskQuestionPage } from '../pages/AskQuestionPage'
import { ConversationsPage } from '../pages/ConversationsPage'
import { DashboardPage } from '../pages/DashboardPage'
import { DocumentsPage } from '../pages/DocumentsPage'
import { LoginPage } from '../pages/LoginPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { RegisterPage } from '../pages/RegisterPage'
import { ProtectedRoute } from './ProtectedRoute'

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
              element={<ConversationsPage />}
            />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
