import { Link } from "react-router-dom"
import { Sparkle, Coffee, GraduationCap } from "@phosphor-icons/react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Rating, TeacherWithAssignments } from "@/api/types"

interface TeacherCardProps {
  teacher: TeacherWithAssignments
  myRating?: Rating
}

function RatingBadge({ rating }: { rating?: Rating }) {
  if (!rating) {
    return (
      <div className="flex items-center gap-1 shrink-0 text-muted-foreground/50">
        <Sparkle className="h-3.5 w-3.5" />
        <span className="text-xs">—</span>
        <Coffee className="h-3.5 w-3.5" />
        <span className="text-xs">—</span>
        <GraduationCap className="h-3.5 w-3.5" />
        <span className="text-xs">—</span>
        <span className="ml-0.5 h-1.5 w-1.5 rounded-full bg-amber-500" />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 shrink-0 text-muted-foreground">
      <Sparkle className="h-3.5 w-3.5" />
      <span className="text-xs font-mono font-medium">{rating.vibe_score}</span>
      <Coffee className="h-3.5 w-3.5" />
      <span className="text-xs font-mono font-medium">{rating.easy_score}</span>
      <GraduationCap className="h-3.5 w-3.5" />
      <span className="text-xs font-mono font-medium">{rating.quality_score}</span>
    </div>
  )
}

export function TeacherCard({ teacher, myRating }: TeacherCardProps) {
  const courses = Array.from(
    new Set(teacher.assignments.map((a) => a.course.number))
  ).sort((a, b) => a - b)
  const subjects = Array.from(
    new Set(teacher.assignments.map((a) => a.subject.name))
  ).slice(0, 3)

  return (
    <Link to={`/teachers/${teacher.id}`}>
      <Card className="h-full transition-colors hover:border-primary/50 hover:bg-accent/40">
        <CardContent className="flex flex-col gap-3 p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-semibold leading-tight">{teacher.full_name}</h3>
            <RatingBadge rating={myRating} />
          </div>

          {courses.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {courses.map((course) => (
                <Badge key={course} variant="secondary">
                  {course} курс
                </Badge>
              ))}
            </div>
          )}

          {subjects.length > 0 && (
            <p className="line-clamp-2 text-xs text-muted-foreground">
              {subjects.join(", ")}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
