import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from '../pages/LoginPage'
import { RegisterPage } from '../pages/RegisterPage'
import { ProtectedRoute } from './ProtectedRoute'

function Placeholder({ title }: { title: string }) {
  return <main className="p-6"><h1 className="text-2xl font-semibold">{title}</h1></main>
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Placeholder title="Dashboard" />} />
          <Route path="/documents" element={<Placeholder title="Documents" />} />
          <Route
            path="/documents/:documentId/ask"
            element={<Placeholder title="Ask a document" />}
          />
          <Route
            path="/conversations"
            element={<Placeholder title="Conversations" />}
          />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
