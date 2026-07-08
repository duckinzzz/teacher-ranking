import { Medal, Star } from "@phosphor-icons/react"
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

export function LeaderboardTable({
  rankings = [],
  isLoading,
  category,
}: LeaderboardTableProps) {
  const avgKey = CATEGORY_KEYS[category]

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
              <TableHead className="text-right">Средний балл</TableHead>
              <TableHead className="text-right">Оценок</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rankings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Пока нет оценок в этой категории
                </TableCell>
              </TableRow>
            ) : (
              rankings.map((item) => {
                const avg = item[avgKey] as number | null
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {item.rank <= 3 && (
                          <Medal
                            weight="fill"
                            className={
                              item.rank === 1
                                ? "h-4 w-4 text-amber-500"
                                : item.rank === 2
                                  ? "h-4 w-4 text-slate-400"
                                  : "h-4 w-4 text-amber-700"
                            }
                          />
                        )}
                        <span className="font-mono font-medium">{item.rank}</span>
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
