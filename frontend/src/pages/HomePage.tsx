import { Link, useNavigate } from "react-router-dom"
import {
  List,
  ArrowRight,
  Star,
  Sparkle,
  Coffee,
  GraduationCap,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuthContext } from "@/hooks/useAuthContext"
import { useTeacherRankings } from "@/hooks/useTeachers"
import type { RankingCategory, TeacherRanking } from "@/api/types"

interface CategoryMiniCardProps {
  category: RankingCategory
  label: string
  icon: React.ReactNode
  colorClass: string
}

const CATEGORY_META: CategoryMiniCardProps[] = [
  {
    category: "vibe",
    label: "Вайбовости",
    icon: <Sparkle className="h-5 w-5" />,
    colorClass: "from-violet-500/10 to-transparent",
  },
  {
    category: "easy",
    label: "Халявности",
    icon: <Coffee className="h-5 w-5" />,
    colorClass: "from-amber-500/10 to-transparent",
  },
  {
    category: "quality",
    label: "Качеству",
    icon: <GraduationCap className="h-5 w-5" />,
    colorClass: "from-emerald-500/10 to-transparent",
  },
]

function TopFiveList({
  rankings,
  isLoading,
  scoreKey,
}: {
  rankings?: TeacherRanking[]
  isLoading: boolean
  scoreKey: "avg_vibe" | "avg_easy" | "avg_quality"
}) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-5 w-full" />
        ))}
      </div>
    )
  }

  if (!rankings || rankings.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        Пока нет оценок
      </p>
    )
  }

  return (
    <ol className="space-y-1.5">
      {rankings.slice(0, 5).map((item) => {
        const score = item[scoreKey] as number | null
        return (
          <li
            key={item.id}
            className="flex items-center justify-between text-sm"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span className="w-5 shrink-0 text-right font-mono text-xs tabular-nums text-muted-foreground">
                {item.rank}
              </span>
              <Link
                to={`/teachers/${item.id}`}
                className="truncate font-medium hover:underline"
              >
                {item.full_name}
              </Link>
            </span>
            <span className="ml-2 shrink-0 font-mono text-xs tabular-nums font-semibold">
              {score !== null && score !== undefined ? score.toFixed(2) : "-"}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

export function HomePage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthContext()

  const { data: vibe, isLoading: vibeLoading } = useTeacherRankings("vibe")
  const { data: easy, isLoading: easyLoading } = useTeacherRankings("easy")
  const { data: quality, isLoading: qualityLoading } = useTeacherRankings("quality")

  const rankingsByCategory = {
    vibe: { data: vibe, isLoading: vibeLoading, scoreKey: "avg_vibe" as const },
    easy: { data: easy, isLoading: easyLoading, scoreKey: "avg_easy" as const },
    quality: { data: quality, isLoading: qualityLoading, scoreKey: "avg_quality" as const },
  }

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight md:text-5xl">
          Оценивай преподавателей
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          Делись мнением о вайбовости, халявности и качестве обучения. Помоги другим студентам выбирать.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link to="/teachers">
              <List className="mr-2 h-5 w-5" />
              Все преподаватели
            </Link>
          </Button>
          {isAuthenticated ? (
            <Button variant="outline" size="lg" onClick={() => navigate("/next")}>
              <Star className="mr-2 h-5 w-5" />
              Оценить следующего
            </Button>
          ) : (
            <Button variant="outline" size="lg" onClick={() => navigate("/login")}>
              Войти, чтобы оценивать
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {CATEGORY_META.map(({ category, label, icon, colorClass }) => {
          const { data, isLoading, scoreKey } = rankingsByCategory[category]
          return (
            <Card
              key={category}
              className={`bg-gradient-to-br ${colorClass} flex flex-col`}
            >
              <Link
                to={`/leaderboard?category=${category}`}
                className="group block rounded-t-xl transition-colors hover:bg-accent/30"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base transition-colors group-hover:text-primary">
                    {icon}
                    Топ по {label.toLowerCase()}
                    <ArrowRight className="ml-auto h-4 w-4 shrink-0 opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                  </CardTitle>
                </CardHeader>
              </Link>
              <CardContent className="flex-1">
                <TopFiveList
                  rankings={data}
                  isLoading={isLoading}
                  scoreKey={scoreKey}
                />
              </CardContent>
            </Card>
          )
        })}
      </section>
    </div>
  )
}
