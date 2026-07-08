import { useMemo, useState } from "react"
import { Medal, Star, CaretUp, CaretDown } from "@phosphor-icons/react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { RankingCategory, TeacherRanking } from "@/api/types"

interface LeaderboardTableProps {
  rankings?: TeacherRanking[]
  isLoading: boolean
  category: RankingCategory
}

const CATEGORY_LABELS: Record<RankingCategory, string> = {
  vibe: "Вайбовость",
  easy: "Халявность",
  quality: "Качество обучения",
}

const CATEGORY_KEYS: Record<RankingCategory, keyof TeacherRanking> = {
  vibe: "avg_vibe",
  easy: "avg_easy",
  quality: "avg_quality",
}

type SortField = "avg" | "count"
type SortDir = "asc" | "desc"

function SortIcon({ field, sortField, sortDir }: { field: SortField; sortField: SortField | null; sortDir: SortDir }) {
  if (sortField !== field) return null
  return sortDir === "desc"
    ? <CaretDown className="h-3.5 w-3.5" />
    : <CaretUp className="h-3.5 w-3.5" />
}

export function LeaderboardTable({
  rankings = [],
  isLoading,
  category,
}: LeaderboardTableProps) {
  const avgKey = CATEGORY_KEYS[category]
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>("desc")

  function handleSortToggle(field: SortField) {
    if (sortField !== field) {
      setSortField(field)
      setSortDir("desc")
    } else if (sortDir === "desc") {
      setSortDir("asc")
    } else {
      setSortField(null)
    }
  }

  const sorted = useMemo(() => {
    if (!sortField) return rankings
    return [...rankings].sort((a, b) => {
      let valA: number
      let valB: number
      if (sortField === "avg") {
        valA = (a[avgKey] as number) ?? 0
        valB = (b[avgKey] as number) ?? 0
      } else {
        valA = a.ratings_count
        valB = b.ratings_count
      }
      return sortDir === "desc" ? valB - valA : valA - valB
    })
  }, [rankings, sortField, sortDir, avgKey])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Star className="h-5 w-5" />
          {CATEGORY_LABELS[category]}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Место</TableHead>
              <TableHead>Преподаватель</TableHead>
              <TableHead className="text-right">
                <button
                  type="button"
                  className={cn(
                    "inline-flex items-center gap-1 hover:text-foreground transition-colors",
                    sortField === "avg" ? "text-foreground" : "text-muted-foreground"
                  )}
                  onClick={() => handleSortToggle("avg")}
                >
                  Средний балл
                  <SortIcon field="avg" sortField={sortField} sortDir={sortDir} />
                </button>
              </TableHead>
              <TableHead className="text-right">
                <button
                  type="button"
                  className={cn(
                    "inline-flex items-center gap-1 hover:text-foreground transition-colors",
                    sortField === "count" ? "text-foreground" : "text-muted-foreground"
                  )}
                  onClick={() => handleSortToggle("count")}
                >
                  Оценок
                  <SortIcon field="count" sortField={sortField} sortDir={sortDir} />
                </button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Пока нет оценок в этой категории
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((item, index) => {
                const avg = item[avgKey] as number | null
                const rank = index + 1
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {rank <= 3 && (
                          <Medal
                            weight="fill"
                            className={
                              rank === 1
                                ? "h-4 w-4 text-amber-500"
                                : rank === 2
                                  ? "h-4 w-4 text-slate-400"
                                  : "h-4 w-4 text-amber-700"
                            }
                          />
                        )}
                        <span className="font-mono font-medium">{rank}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link
                        to={`/teachers/${item.id}`}
                        className="font-medium hover:underline"
                      >
                        {item.full_name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold">
                      {avg !== null && avg !== undefined ? avg.toFixed(2) : "-"}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {item.ratings_count}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
