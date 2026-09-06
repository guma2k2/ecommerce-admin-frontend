import apiClient from '~/shared/services/axiosClient'
import type {
  ApiResponse,
  ProductItem,
  GetProductsParams,
  PaginatedProductsResponse,
  PageResponse,
  ProductCreateRequest,
  ProductUpdateRequest,
  ProductResponse
} from '~/shared/types'

export type { ProductItem, GetProductsParams, PaginatedProductsResponse }

/**
 * Fetches product details by ID.
 * Endpoint: GET /api/v1/products/{productId}
 */
export async function getProductById(id: string | number): Promise<ProductResponse> {
  const response = await apiClient.get<ApiResponse<ProductResponse>>(`/products/${id}`)
  return response.data.data
}

/**
 * Creates a new product.
 * Endpoint: POST /api/v1/products
 */
export async function createProduct(payload: ProductCreateRequest): Promise<ProductResponse> {
  const response = await apiClient.post<ApiResponse<ProductResponse>>('/products', payload)
  return response.data.data
}

/**
 * Updates an existing product by ID.
 * Endpoint: PUT /api/v1/products/{productId}
 */
export async function updateProduct(
  id: string | number,
  payload: ProductUpdateRequest
): Promise<ProductResponse> {
  const response = await apiClient.put<ApiResponse<ProductResponse>>(`/products/${id}`, payload)
  return response.data.data
}

/**
 * Deletes a product by ID.
 * Endpoint: DELETE /api/v1/products/{productId}
 */
export async function deleteProduct(id: string | number): Promise<void> {
  await apiClient.delete<ApiResponse<void>>(`/products/${id}`)
}

/**
 * Fetches a paginated list of products from backend API.
 * Uses 0-based page numbering as expected by Spring Boot Pageable.
 */
export async function getProductsPage(
  params: GetProductsParams = {}
): Promise<PageResponse<ProductItem>> {
  const pageNumber = params.pageNumber !== undefined ? Math.max(0, params.pageNumber) : 0
  const pageSize = params.pageSize ?? 10

  const response = await apiClient.get<ApiResponse<PageResponse<ProductItem>>>('/products/page', {
    params: {
      pageNumber,
      pageSize,
      ...(params.search?.trim() ? { search: params.search.trim() } : {})
    }
  })

  return response.data.data
}

/**
 * Helper for React Router clientLoader & UI components using 1-based page numbers.
 */
export async function getProducts(
  params: GetProductsParams = {}
): Promise<PageResponse<ProductItem>> {
  const uiPageNumber = params.pageNumber ?? 1
  const zeroBasedPage = Math.max(0, uiPageNumber - 1)
  const pageSize = params.pageSize ?? 10

  try {
    const response = await apiClient.get<ApiResponse<PageResponse<ProductItem>>>('/products/page', {
      params: {
        pageNumber: zeroBasedPage,
        pageSize,
        ...(params.search?.trim() ? { search: params.search.trim() } : {})
      }
    })

    const data = response.data.data
    let content = data.content || []

    if (params.search?.trim()) {
      const term = params.search.trim().toLowerCase()
      content = content.filter((p) => p.name.toLowerCase().includes(term))
    }

    if (params.sortField) {
      content = [...content].sort((a, b) => {
        const field = params.sortField as keyof ProductItem
        const valA = String(a[field] ?? '')
        const valB = String(b[field] ?? '')
        const comp = valA.localeCompare(valB)
        return params.sortDir === 'desc' ? -comp : comp
      })
    }

    return {
      ...data,
      content,
      pageNumber: uiPageNumber
    }
  } catch {
    // If /products/page is not yet deployed or error occurs, return empty page response
    return {
      content: [],
      pageNumber: uiPageNumber,
      pageSize,
      totalElements: 0,
      totalPages: 1
    }
  }
}

export const productService = {
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsPage,
  getProducts
}

export default productService

