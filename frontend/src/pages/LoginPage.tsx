import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { SignIn, User } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useLogin } from "@/hooks/useAuth"
import { toast } from "sonner"

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [name, setName] = useState("")
  const login = useLogin()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Введите имя")
      return
    }
    try {
      await login.mutateAsync({ name: name.trim() })
      const from = (location.state as { from?: { pathname?: string } })?.from?.pathname
      navigate(from || "/teachers", { replace: true })
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Не удалось войти"
      toast.error(message, { duration: 6000 })
    }
  }

  return (
    <div className="flex min-h-[60dvh] items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <User className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Вход</CardTitle>
          <CardDescription>
            Введите имя, чтобы оценивать преподавателей
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Имя</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Как вас зовут?"
                autoComplete="name"
                autoFocus
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={login.isPending || !name.trim()}
            >
              <SignIn className="mr-2 h-4 w-4" />
              {login.isPending ? "Вход..." : "Войти"}
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link to="/">На главную</Link>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
