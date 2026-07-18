import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { getCurrentUser } from '../api/auth.api'
import type { User } from '../types/auth'
import { tokenStorage } from '../utils/storage'

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (token: string) => Promise<User>
  logout: () => void
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => tokenStorage.get() !== null,
  )
  const [isLoading, setIsLoading] = useState(isAuthenticated)

  const login = useCallback(async (token: string) => {
    tokenStorage.set(token)
    setIsLoading(true)

    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      setIsAuthenticated(true)
      return currentUser
    } catch (error) {
      tokenStorage.remove()
      setUser(null)
      setIsAuthenticated(false)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    tokenStorage.remove()
    setUser(null)
    setIsAuthenticated(false)
  }, [])

  useEffect(() => {
    if (!tokenStorage.get()) {
      return
    }

    let isActive = true

    getCurrentUser()
      .then((currentUser) => {
        if (isActive) {
          setUser(currentUser)
          setIsAuthenticated(true)
        }
      })
      .catch(() => {
        tokenStorage.remove()
        if (isActive) {
          setIsAuthenticated(false)
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [])

  const value = useMemo(
    () => ({ user, isAuthenticated, isLoading, login, logout }),
    [user, isAuthenticated, isLoading, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
