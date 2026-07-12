import { useState } from "react"
import { useParams } from "react-router-dom"
import { TeacherDetail, type SortMode } from "@/components/teacher/TeacherDetail"
import { useAuthContext } from "@/hooks/useAuthContext"
import {
  useTeacher,
  useTeacherAssignments,
  useTeacherRanking,
} from "@/hooks/useTeachers"
import { useTeacherRatings, useRatingReaction } from "@/hooks/useRatings"
import { toast } from "sonner"

export function TeacherPage() {
  const { id } = useParams()
  const teacherId = Number(id)
  const { isAuthenticated, person } = useAuthContext()
  const [sortMode, setSortMode] = useState<SortMode>("date")

  const ordering = sortMode === "likes" ? "like_count" : undefined

  const { data: teacher, isLoading: isLoadingTeacher } = useTeacher(teacherId)
  const { data: assignments, isLoading: isLoadingAssignments } =
    useTeacherAssignments(teacherId)
  const { data: ranking, isLoading: isLoadingRanking } =
    useTeacherRanking(teacherId)
  const { data: ratings, isLoading: isLoadingRatings } =
    useTeacherRatings(teacherId, ordering)

  const reactMutation = useRatingReaction()

  const handleReact = (ratingId: number, value: 1 | -1) => {
    reactMutation.mutate(
      { ratingId, value },
      {
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : "Не удалось выполнить действие")
        },
      }
    )
  }

  const teacherWithAssignments = teacher
    ? { ...teacher, assignments: assignments ?? [] }
    : undefined

  return (
    <TeacherDetail
      teacher={teacherWithAssignments}
      ranking={ranking}
      ratings={ratings}
      isLoading={
        isLoadingTeacher || isLoadingAssignments || isLoadingRanking || isLoadingRatings
      }
      isAuthenticated={isAuthenticated}
      currentPersonId={person?.id}
      sortMode={sortMode}
      onSortChange={setSortMode}
      onReact={handleReact}
    />
  )
}