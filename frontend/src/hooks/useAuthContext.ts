import { createContext, useContext } from "react"
import type { Person } from "@/api/types"

interface AuthContextValue {
  person: Person | null | undefined
  isLoading: boolean
  isAuthenticated: boolean
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuthContext must be used within AuthProvider")
  }
  return ctx
}

export function useOptionalPerson(): Person | null {
  return useContext(AuthContext)?.person ?? null
}
