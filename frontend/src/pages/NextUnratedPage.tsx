import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Spinner } from "@phosphor-icons/react"
import { Skeleton } from "@/components/ui/skeleton"
import { useNextUnratedTeacher } from "@/hooks/useTeachers"
import { toast } from "sonner"

export function NextUnratedPage() {
  const navigate = useNavigate()
  const { data, isLoading, error } = useNextUnratedTeacher()

  useEffect(() => {
    if (isLoading) return
    if (error) {
      toast.error("Не удалось загрузить следующего преподавателя")
      navigate("/teachers")
      return
    }
    if (data?.done || !data?.teacher) {
      toast.success("Вы оценили всех преподавателей")
      navigate("/teachers")
      return
    }
    navigate(`/teachers/${data.teacher.id}/rate`, { replace: true })
  }, [data, isLoading, error, navigate])

  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-4 text-center">
      <Spinner className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground">Ищем следующего преподавателя...</p>
      <Skeleton className="h-4 w-48" />
    </div>
  )
}
