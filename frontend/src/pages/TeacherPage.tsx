import { useParams } from "react-router-dom"
import { TeacherDetail } from "@/components/teacher/TeacherDetail"
import { useAuthContext } from "@/hooks/useAuthContext"
import {
  useTeacher,
  useTeacherAssignments,
  useTeacherRanking,
} from "@/hooks/useTeachers"

export function TeacherPage() {
  const { id } = useParams()
  const teacherId = Number(id)
  const { isAuthenticated } = useAuthContext()

  const { data: teacher, isLoading: isLoadingTeacher } = useTeacher(teacherId)
  const { data: assignments, isLoading: isLoadingAssignments } =
    useTeacherAssignments(teacherId)
  const { data: ranking, isLoading: isLoadingRanking } =
    useTeacherRanking(teacherId)

  const teacherWithAssignments = teacher
    ? { ...teacher, assignments: assignments ?? [] }
    : undefined

  return (
    <TeacherDetail
      teacher={teacherWithAssignments}
      ranking={ranking}
      isLoading={
        isLoadingTeacher || isLoadingAssignments || isLoadingRanking
      }
      isAuthenticated={isAuthenticated}
    />
  )
}
