import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createRating, deleteRating, listRatings, reactToRating } from "@/api/ratings"
import { teacherKeys } from "./useTeachers"

export const ratingKeys = {
  all: ["ratings"] as const,
  forTeacher: (id: number) => [...ratingKeys.all, "teacher", id] as const,
  forPerson: (id: number) => [...ratingKeys.all, "person", id] as const,
}

export function useTeacherRatings(teacherId: number, ordering?: string) {
  return useQuery({
    queryKey: [...ratingKeys.forTeacher(teacherId), ordering ?? "date"],
    queryFn: () => listRatings({ teacher: teacherId, ordering }),
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
      // Invalidate all rating caches — forTeacher and forPerson both need refresh
      queryClient.invalidateQueries({ queryKey: ratingKeys.all })
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

export function useRatingReaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ ratingId, value }: { ratingId: number; value: 1 | -1 }) =>
      reactToRating(ratingId, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ratingKeys.all })
    },
  })
}

export function useDeleteRating() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteRating,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ratingKeys.all })
      // Also invalidate rankings since average scores changed
      queryClient.invalidateQueries({ queryKey: teacherKeys.all })
    },
  })
}
