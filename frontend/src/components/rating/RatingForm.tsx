import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowRight } from "@phosphor-icons/react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ScoreInput } from "./ScoreInput"
import { getNextUnratedTeacher, skipTeacher } from "@/api/teachers"
import { useCreateRating } from "@/hooks/useRatings"
import type { Rating, Teacher, TeacherAssignment } from "@/api/types"

interface RatingFormProps {
  teacher: Teacher
  assignments?: TeacherAssignment[]
  isLoadingAssignments?: boolean
  existingRating?: Rating
}

export function RatingForm({ teacher, assignments, isLoadingAssignments, existingRating }: RatingFormProps) {
  const navigate = useNavigate()
  const createRating = useCreateRating()
  const [vibeScore, setVibeScore] = useState(existingRating?.vibe_score ?? 5)
  const [easyScore, setEasyScore] = useState(existingRating?.easy_score ?? 5)
  const [qualityScore, setQualityScore] = useState(existingRating?.quality_score ?? 5)
  const [comment, setComment] = useState(existingRating?.comment ?? "")

  async function saveRating() {
    await createRating.mutateAsync({
      teacher_id: teacher.id,
      vibe_score: vibeScore,
      easy_score: easyScore,
      quality_score: qualityScore,
      comment,
    })
  }

  /** Fetch next unrated teacher directly (bypasses React Query cache to avoid stale-data races). */
  async function goToNextTeacher() {
    const next = await getNextUnratedTeacher()
    if (next.done || !next.teacher) {
      toast.success("Вы оценили всех преподавателей")
      navigate("/teachers", { replace: true })
    } else {
      navigate(`/teachers/${next.teacher.id}/rate`, { replace: true })
    }
  }

  async function handleSave() {
    try {
      await saveRating()
      toast.success("Оценка сохранена")
      navigate(`/teachers/${teacher.id}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Не удалось сохранить оценку"
      toast.error(message)
    }
  }

  async function handleSaveAndNext() {
    try {
      await saveRating()
      toast.success("Оценка сохранена")
      await goToNextTeacher()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Не удалось сохранить оценку"
      toast.error(message)
    }
  }

  async function handleSkip() {
    try {
      await skipTeacher(teacher.id)
      toast.success("Пропущено")
      await goToNextTeacher()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Не удалось пропустить"
      toast.error(message)
    }
  }

  const assignmentsByCourse =
    assignments?.reduce(
      (acc, assignment) => {
        const courseNum = assignment.course.number
        if (!acc[courseNum]) acc[courseNum] = []
        acc[courseNum].push(assignment.subject.name)
        return acc
      },
      {} as Record<number, string[]>
    ) ?? {}

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSave() }} className="space-y-8">
      {isLoadingAssignments ? (
        <Skeleton className="h-12 w-full" />
      ) : Object.keys(assignmentsByCourse).length > 0 ? (
        <div className="space-y-2">
          {Object.entries(assignmentsByCourse)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([course, subjects]) => (
              <div key={course} className="flex items-baseline gap-2 text-sm">
                <span className="font-medium text-muted-foreground shrink-0">
                  {course} курс:
                </span>
                <div className="flex flex-wrap gap-1">
                  {Array.from(new Set(subjects)).map((subject) => (
                    <Badge key={subject} variant="secondary">
                      {subject}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
        </div>
      ) : null}

      <div className="space-y-6">
        <ScoreInput
          label="Вайбовость"
          description="Общая атмосфера и комфорт на занятиях"
          value={vibeScore}
          onChange={setVibeScore}
        />
        <ScoreInput
          label="Халявность"
          description="Насколько лоялен преподаватель к студентам"
          value={easyScore}
          onChange={setEasyScore}
        />
        <ScoreInput
          label="Качество обучения"
          description="Польза материала и ясность изложения"
          value={qualityScore}
          onChange={setQualityScore}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="comment">Комментарий (необязательно)</Label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Что запомнилось?"
          rows={4}
        />
      </div>

      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <Button
          type="button"
          onClick={handleSaveAndNext}
          disabled={createRating.isPending}
        >
          {createRating.isPending ? "Сохранение..." : "Сохранить и оценить следующего"}
          <ArrowRight className="ml-1.5 h-4 w-4" />
        </Button>
        <Button type="submit" variant="secondary" disabled={createRating.isPending}>
          {createRating.isPending ? "Сохранение..." : "Сохранить"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleSkip}
          disabled={createRating.isPending}
        >
          Я не знаю кто это
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            if (window.history.length > 1) {
              navigate(-1)
            } else {
              navigate(`/teachers/${teacher.id}`)
            }
          }}
          disabled={createRating.isPending}
        >
          Отмена
        </Button>
      </div>
    </form>
  )
}
