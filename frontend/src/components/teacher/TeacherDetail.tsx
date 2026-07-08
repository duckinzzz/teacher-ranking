import { Link } from "react-router-dom"
import { PencilSimple, Star } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import type { Rating, TeacherRanking, TeacherWithAssignments } from "@/api/types"

interface TeacherDetailProps {
  teacher?: TeacherWithAssignments
  ranking?: TeacherRanking
  ratings?: Rating[]
  isLoading: boolean
  isAuthenticated: boolean
}

function ScoreRow({
  label,
  value,
}: {
  label: string
  value: number | null | undefined
}) {
  const color =
    value === null || value === undefined
      ? "text-muted-foreground"
      : value <= 3
        ? "text-rose-600 dark:text-rose-400"
        : value <= 6
          ? "text-amber-600 dark:text-amber-400"
          : "text-emerald-600 dark:text-emerald-400"

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={cn("font-mono text-lg font-semibold", color)}>
        {value !== null && value !== undefined ? value.toFixed(1) : "-"}
      </span>
    </div>
  )
}

export function TeacherDetail({
  teacher,
  ranking,
  ratings,
  isLoading,
  isAuthenticated,
}: TeacherDetailProps) {
  if (isLoading || !teacher) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  const assignmentsByCourse = teacher.assignments.reduce(
    (acc, assignment) => {
      const courseNum = assignment.course.number
      if (!acc[courseNum]) acc[courseNum] = []
      acc[courseNum].push(assignment.subject.name)
      return acc
    },
    {} as Record<number, string[]>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {teacher.full_name}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {teacher.assignments.length > 0
              ? "Преподаватель по направлениям"
              : "Нет предметов"}
          </p>
        </div>
        {isAuthenticated && (
          <Button asChild>
            <Link to={`/teachers/${teacher.id}/rate`}>
              <PencilSimple className="mr-2 h-4 w-4" />
              Оценить
            </Link>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Средний рейтинг
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScoreRow label="Вайбовость" value={ranking?.avg_vibe} />
            <Separator />
            <ScoreRow label="Халявность" value={ranking?.avg_easy} />
            <Separator />
            <ScoreRow label="Качество обучения" value={ranking?.avg_quality} />
            <Separator />
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm text-muted-foreground">Оценок</span>
              <span className="font-mono font-semibold">
                {ranking?.ratings_count ?? 0}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Предметы</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(assignmentsByCourse).length === 0 ? (
              <p className="text-sm text-muted-foreground">Нет данных</p>
            ) : (
              Object.entries(assignmentsByCourse)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([course, subjects]) => (
                  <div key={course}>
                    <p className="mb-2 text-sm font-medium">{course} курс</p>
                    <div className="flex flex-wrap gap-1">
                      {Array.from(new Set(subjects)).map((subject) => (
                        <Badge key={subject} variant="outline">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Мнения</CardTitle>
        </CardHeader>
        <CardContent>
          {!ratings || ratings.length === 0 ? (
            <p className="text-sm text-muted-foreground">Пока нет комментариев</p>
          ) : (
            <div className="space-y-4">
              {ratings.map((rating) => (
                <div
                  key={rating.id}
                  className="rounded-lg border bg-muted/30 p-4"
                >
                  <div className="mb-2 flex items-center gap-2 text-sm">
                    <span className="font-medium">{rating.person.name}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground">
                      {new Date(rating.created_at).toLocaleDateString("ru-RU", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  {rating.comment && (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {rating.comment}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span>Вайбовость: {rating.vibe_score}/10</span>
                    <span>Халявность: {rating.easy_score}/10</span>
                    <span>Качество: {rating.quality_score}/10</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
