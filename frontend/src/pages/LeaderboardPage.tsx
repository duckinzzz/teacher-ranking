import { useState } from "react"
import { useSearchParams } from "react-router-dom"
import { ChartBar } from "@phosphor-icons/react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable"
import { useTeacherRankings } from "@/hooks/useTeachers"
import type { RankingCategory } from "@/api/types"

const CATEGORIES: { value: RankingCategory; label: string }[] = [
  { value: "vibe", label: "Вайбовость" },
  { value: "easy", label: "Халявность" },
  { value: "quality", label: "Качество" },
]

function parseCategory(raw: string | null): RankingCategory {
  if (raw === "easy" || raw === "quality") return raw
  return "vibe"
}

export function LeaderboardPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [category, setCategory] = useState<RankingCategory>(
    () => parseCategory(searchParams.get("category"))
  )

  function handleCategoryChange(value: string) {
    const cat = value as RankingCategory
    setCategory(cat)
    setSearchParams({ category: cat }, { replace: true })
  }
  const { data: rankings, isLoading } = useTeacherRankings(category)

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
          <ChartBar className="h-8 w-8 text-primary" />
          Рейтинг преподавателей
        </h1>
        <p className="text-muted-foreground">
          Сортировка по среднему баллу в каждой категории
        </p>
      </div>

      <Tabs value={category} onValueChange={handleCategoryChange}>
        <TabsList className="w-full sm:w-auto">
          {CATEGORIES.map((cat) => (
            <TabsTrigger key={cat.value} value={cat.value}>
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <LeaderboardTable
        rankings={rankings}
        isLoading={isLoading}
        category={category}
      />
    </div>
  )
}
