import type { AxiosProgressEvent } from 'axios'
import type { PageResponse, SortDirection } from './pagination'

export type MediaType = 'IMAGE' | 'VIDEO'

export interface MediaResponse {
  id: string
  name: string
  url: string
  type: MediaType
  size: number
  altText?: string | null
  fileType: string
  active: boolean
  duration?: string | null
  createdAt?: string
  updatedAt?: string
  created_at?: string
  updated_at?: string
}

export type MediaItem = MediaResponse

export interface UploadMediaPayload {
  file: File
  altText?: string
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
}

export interface GetMediaParams {
  pageNumber?: number
  pageSize?: number
  sortField?: string
  sortDir?: SortDirection
  search?: string
  type?: string
}

export type GetMediaResponse = PageResponse<MediaResponse>
export type MediaTypeFilter = 'all' | 'image' | 'video' | 'document'

