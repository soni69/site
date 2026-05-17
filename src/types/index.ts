/**
 * Shared application types.
 * Payload-generated types (payload-types.ts) will appear here after first build.
 */

// Re-export Payload generated types when available
// export type * from './payload-types'

// ─── Common utility types ────────────────────────────────────────────────────

export type Nullable<T> = T | null

export type Maybe<T> = T | null | undefined

/** Generic paginated response */
export interface PaginatedResult<T> {
  docs: T[]
  totalDocs: number
  limit: number
  totalPages: number
  page: number
  pagingCounter: number
  hasPrevPage: boolean
  hasNextPage: boolean
  prevPage: number | null
  nextPage: number | null
}
