import { Link } from "react-router-dom"
import { Star } from "@phosphor-icons/react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { TeacherWithAssignments } from "@/api/types"

interface TeacherCardProps {
  teacher: TeacherWithAssignments
}

export function TeacherCard({ teacher }: TeacherCardProps) {
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
            <Star className="h-4 w-4 shrink-0 text-muted-foreground" />
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
