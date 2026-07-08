import { useEffect, useState, type ReactNode } from "react"
import { useMe } from "@/hooks/useAuth"
import { AuthContext } from "@/hooks/useAuthContext"

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: person, isLoading } = useMe()
  const [bootstrapped, setBootstrapped] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      setBootstrapped(true)
    }
  }, [isLoading])

  const isAuthenticated = !!person

  return (
    <AuthContext.Provider
      value={{
        person,
        isLoading: !bootstrapped,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
