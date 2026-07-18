import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react'
import { tokenStorage } from '../utils/storage'

interface AuthContextValue {
  isAuthenticated: boolean
  login: (token: string) => void
  logout: () => void
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => tokenStorage.get() !== null,
  )

  const login = useCallback((token: string) => {
    tokenStorage.set(token)
    setIsAuthenticated(true)
  }, [])

  const logout = useCallback(() => {
    tokenStorage.remove()
    setIsAuthenticated(false)
  }, [])

  const value = useMemo(
    () => ({ isAuthenticated, login, logout }),
    [isAuthenticated, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
