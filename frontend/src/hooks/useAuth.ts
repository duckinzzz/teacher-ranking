import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { login, logout, me } from "@/api/auth"

export const authKeys = {
  me: ["auth", "me"] as const,
}

export function useMe() {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: me,
    retry: (failureCount, error) => {
      // Retry once for network errors, never for auth errors
      if (error instanceof TypeError) {
        return failureCount < 1
      }
      return false
    },
    staleTime: 30 * 60 * 1000,  // 30 minutes — session rarely changes
  })
}

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: login,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.me })
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.removeQueries()
    },
  })
}
