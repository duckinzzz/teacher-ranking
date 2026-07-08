import { useParams } from "react-router-dom"
import { TeacherDetail } from "@/components/teacher/TeacherDetail"
import { useAuthContext } from "@/hooks/useAuthContext"
import {
  useTeacher,
  useTeacherAssignments,
  useTeacherRanking,
} from "@/hooks/useTeachers"
import { useTeacherRatings } from "@/hooks/useRatings"

export function TeacherPage() {
  const { id } = useParams()
  const teacherId = Number(id)
  const { isAuthenticated } = useAuthContext()

  const { data: teacher, isLoading: isLoadingTeacher } = useTeacher(teacherId)
  const { data: assignments, isLoading: isLoadingAssignments } =
    useTeacherAssignments(teacherId)
  const { data: ranking, isLoading: isLoadingRanking } =
    useTeacherRanking(teacherId)
  const { data: ratings, isLoading: isLoadingRatings } =
    useTeacherRatings(teacherId)

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
    />
  )
}
