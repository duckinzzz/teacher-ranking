import { apiRequest } from "./client"
import { endpoints, ratingReactUrl } from "./endpoints"
import type { Rating, RatingPayload } from "./types"

export async function createRating(payload: RatingPayload) {
  return apiRequest<Rating>(endpoints.ratings, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function listRatings(params?: {
  person?: number
  teacher?: number
  ordering?: string
}) {
  return apiRequest<Rating[]>(endpoints.ratings, { params })
}

export async function reactToRating(ratingId: number, value: 1 | -1) {
  return apiRequest<{ reaction: number | null }>(ratingReactUrl(ratingId), {
    method: "POST",
    body: JSON.stringify({ value }),
  })
}

export async function deleteRating(ratingId: number) {
  return apiRequest<void>(`${endpoints.ratings}${ratingId}/`, {
    method: "DELETE",
  })
}
