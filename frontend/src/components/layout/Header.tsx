import { Link, useLocation } from "react-router-dom"
import {
  ChartBar,
  House,
  List,
  Moon,
  SignIn,
  SignOut,
  Sun,
  User,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { useLogout } from "@/hooks/useAuth"
import { useAuthContext, useOptionalPerson } from "@/hooks/useAuthContext"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

const navItems = [
  { to: "/", label: "Главная", icon: House },
  { to: "/teachers", label: "Преподаватели", icon: List },
  { to: "/leaderboard", label: "Рейтинг", icon: ChartBar },
]

function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  )

  useEffect(() => {
    const root = document.documentElement
    if (theme === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
  }, [theme])

  const toggle = () => setTheme((t) => (t === "light" ? "dark" : "light"))

  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label="Переключить тему">
      {theme === "light" ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </Button>
  )
}

export function Header() {
  const location = useLocation()
  const person = useOptionalPerson()
  const { isAuthenticated } = useAuthContext()
  const logout = useLogout()

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <img src="/favicon.svg" alt="RateProf" className="h-12 w-12" />
          RateProf
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                location.pathname === item.to &&
                  "bg-accent text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isAuthenticated ? (
            <>
              <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
                <User className="h-4 w-4" />
                {person?.name}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  await logout.mutateAsync()
                  window.location.replace("/")
                }}
                disabled={logout.isPending}
              >
                <SignOut className="mr-1.5 h-4 w-4" />
                Выйти
              </Button>
            </>
          ) : (
            <Button asChild variant="ghost" size="sm">
              <Link to="/login">
                <SignIn className="mr-1.5 h-4 w-4" />
                Войти
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
