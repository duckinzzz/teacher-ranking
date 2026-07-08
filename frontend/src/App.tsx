import { ApiError } from "@/api/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Route, Routes } from "react-router-dom"
import { Toaster } from "sonner"
import { AuthProvider } from "@/providers/AuthProvider"
import { RootLayout } from "@/components/layout/RootLayout"
import { ProtectedRoute } from "@/components/layout/ProtectedRoute"
import { HomePage } from "@/pages/HomePage"
import { LoginPage } from "@/pages/LoginPage"
import { TeachersPage } from "@/pages/TeachersPage"
import { TeacherPage } from "@/pages/TeacherPage"
import { RatePage } from "@/pages/RatePage"
import { LeaderboardPage } from "@/pages/LeaderboardPage"
import { NextUnratedPage } from "@/pages/NextUnratedPage"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: (failureCount, error) => {
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          return false
        }
        return failureCount < 2
      },
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<RootLayout />}>
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="teachers" element={<TeachersPage />} />
            <Route path="teachers/:id" element={<TeacherPage />} />
            <Route
              path="teachers/:id/rate"
              element={
                <ProtectedRoute>
                  <RatePage />
                </ProtectedRoute>
              }
            />
            <Route path="leaderboard" element={<LeaderboardPage />} />
            <Route
              path="next"
              element={
                <ProtectedRoute>
                  <NextUnratedPage />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
        <Toaster position="top-center" richColors />
      </AuthProvider>
    </QueryClientProvider>
  )
}
