import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createRating, listRatings } from "@/api/ratings"
import { teacherKeys } from "./useTeachers"

export const ratingKeys = {
  all: ["ratings"] as const,
  forTeacher: (id: number) => [...ratingKeys.all, "teacher", id] as const,
  forPerson: (id: number) => [...ratingKeys.all, "person", id] as const,
}

export function useTeacherRatings(teacherId: number) {
  return useQuery({
    queryKey: ratingKeys.forTeacher(teacherId),
    queryFn: () => listRatings({ teacher: teacherId }),
    enabled: Number.isFinite(teacherId),
  })
}

export function useMyRatings(personId?: number) {
  return useQuery({
    queryKey: ratingKeys.forPerson(personId ?? 0),
    queryFn: () => listRatings({ person: personId }),
    enabled: !!personId,
  })
}

export function useCreateRating() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createRating,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ratingKeys.forTeacher(data.teacher.id),
      })
      queryClient.invalidateQueries({
        queryKey: teacherKeys.ranking(data.teacher.id),
      })
      queryClient.invalidateQueries({
        queryKey: teacherKeys.rankings("vibe"),
      })
      queryClient.invalidateQueries({
        queryKey: teacherKeys.rankings("easy"),
      })
      queryClient.invalidateQueries({
        queryKey: teacherKeys.rankings("quality"),
      })
      queryClient.invalidateQueries({
        queryKey: teacherKeys.nextUnrated(),
      })
    },
  })
}
