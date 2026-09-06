import type { PageResponse, SortDirection } from './pagination'
import type { ProductVariant } from './ProductVariant'

export interface ProductItem {
  id: string
  name: string
  image: string
  created_at: string
  updated_at: string
  createdAt?: string
  updatedAt?: string
}

export interface GetProductsParams {
  pageNumber?: number
  pageSize?: number
  sortField?: string
  sortDir?: SortDirection
  search?: string
}

export type PaginatedProductsResponse = PageResponse<ProductItem>

export type { ProductVariant }

// ==========================================
// Product API Types (from PRODUCT_API_INTEGRATION_GUIDE.md)
// ==========================================

// Media
export interface ProductMediaRequest {
  mediaId: string
  position: number
}

export interface ProductMediaResponse {
  mediaId: string
  position: number
  url: string | null
  variantIds?: number[]
}

// Option & Values
export interface ProductOptionValueRequest {
  id?: number | null
  value: string
  position?: number
}

export interface ProductOptionCombinationRequest {
  id?: number | null
  productOptionId: number
  name?: string
  position?: number
  values: ProductOptionValueRequest[]
}

export interface ProductOptionValueResponse {
  id: number
  value: string
  position: number
}

export interface ProductOptionCombinationResponse {
  id: number
  productOptionId: number
  name: string
  position: number
  values: ProductOptionValueResponse[]
}

// Attributes
export interface ProductAttributeValueRequest {
  id?: number | null
  productAttributeId: number
  value: string
}

export interface ProductAttributeValueResponse {
  id: number
  productAttributeId: number
  name: string
  value: string
}

// Variants
export interface ProductVariantAttributeValueRequest {
  id?: number | null
  productAttributeId: number
  value: string
}

export interface ProductVariantAttributeResponse {
  id?: number
  productAttributeId: number
  name: string
  value: string
}

export interface ProductVariantRequest {
  id?: number | null
  title?: string | null
  sku: string
  price: number
  quantity: number
  mediaId?: string | null
  attributeValues?: ProductVariantAttributeValueRequest[]
  attributes?: ProductVariantAttributeValueRequest[]
}

export interface ProductVariantResponse {
  id: number
  title: string
  productOptionValueIds: number[]
  attributeValues: ProductVariantAttributeResponse[]
  attributes?: ProductVariantAttributeResponse[]
  sku: string
  price: number
  quantity: number
  mediaId: string | null
  mediaUrl: string | null
}

// Brand & Category References
export interface ProductBrandResponse {
  id: number
  name: string
  description: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

export interface ProductCategoryResponse {
  id: number
  name: string
  description?: string | null
}

// Product Create Request
export interface ProductCreateRequest {
  name: string
  slug: string
  description?: string | null
  metaTitle?: string | null
  metaKeyword?: string | null
  metaDescription?: string | null
  categoryId?: number | null
  brandId?: number | null
  medias?: ProductMediaRequest[]
  options?: ProductOptionCombinationRequest[]
  attributes?: ProductAttributeValueRequest[]
  variants: ProductVariantRequest[]
}

// Product Update Request
export interface ProductUpdateRequest {
  name: string
  slug: string
  description?: string | null
  metaTitle?: string | null
  metaKeyword?: string | null
  metaDescription?: string | null
  categoryId?: number | null
  brandId?: number | null
  medias?: ProductMediaRequest[]
  options?: ProductOptionCombinationRequest[]
  attributes?: ProductAttributeValueRequest[]
  variants: ProductVariantRequest[]
}

// Full Product Response
export interface ProductResponse {
  id: number
  name: string
  description: string | null
  slug: string
  metaTitle: string | null
  metaKeyword: string | null
  metaDescription: string | null
  brand: ProductBrandResponse | null
  categoryId?: number | null
  category?: ProductCategoryResponse | null
  medias: ProductMediaResponse[]
  attributes: ProductAttributeValueResponse[]
  options: ProductOptionCombinationResponse[]
  variants: ProductVariantResponse[]
  createdAt: string
  updatedAt: string
}

