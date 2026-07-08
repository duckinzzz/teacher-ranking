import { apiRequest } from "./client"
import { endpoints } from "./endpoints"
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
}) {
  return apiRequest<Rating[]>(endpoints.ratings, { params })
}
