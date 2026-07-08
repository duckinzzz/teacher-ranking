import { Link, useLocation } from "react-router-dom"
import { ChartBar, House, List } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

const navItems = [
  { to: "/", label: "Главная", icon: House },
  { to: "/teachers", label: "Преподаватели", icon: List },
  { to: "/leaderboard", label: "Рейтинг", icon: ChartBar },
]

export function MobileNav() {
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background md:hidden">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center gap-1 text-xs font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon
                weight={isActive ? "fill" : "regular"}
                className="h-5 w-5"
              />
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
