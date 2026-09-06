import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions
} from '@tanstack/react-query'
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProductsPage,
  updateProduct
} from '~/shared/services/api/productService'
import type {
  GetProductsParams,
  PageResponse,
  ProductCreateRequest,
  ProductItem,
  ProductResponse,
  ProductUpdateRequest
} from '~/shared/types'
import { showToast } from '~/shared/utils/toast'

/**
 * Query key factory for product cache management.
 */
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params?: GetProductsParams) => [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id?: number | string) => [...productKeys.details(), id] as const
}

/**
 * React Query hook for fetching a paginated list of products.
 */
export function useProductPageQuery(
  params: GetProductsParams = {},
  options?: Omit<UseQueryOptions<PageResponse<ProductItem>, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<PageResponse<ProductItem>, Error>({
    queryKey: productKeys.list(params),
    queryFn: () => getProductsPage(params),
    placeholderData: (previousData) => previousData,
    ...options
  })
}

/**
 * React Query hook for fetching a single product's details by ID.
 */
export function useProductDetailQuery(
  productId?: number | string,
  options?: Omit<UseQueryOptions<ProductResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ProductResponse, Error>({
    queryKey: productKeys.detail(productId),
    queryFn: () => {
      if (!productId) throw new Error('Product ID is required')
      return getProductById(productId)
    },
    enabled: Boolean(productId),
    ...options
  })
}

/**
 * React Query hook for creating a new product.
 */
export function useCreateProductMutation(
  options?: UseMutationOptions<ProductResponse, Error, ProductCreateRequest>
) {
  const queryClient = useQueryClient()

  return useMutation({
    ...options,
    mutationFn: (payload: ProductCreateRequest) => createProduct(payload),
    onSuccess: (data, variables, context, ...rest) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      if (options?.onSuccess) {
        ;(options.onSuccess as any)(data, variables, context, ...rest)
      }
    },
    onError: (error: any, variables, context, ...rest) => {
      console.error('Create product error:', error)
      const errorMsg = error?.response?.data?.message || error?.message || 'toasts.error'
      showToast('error', errorMsg)
      if (options?.onError) {
        ;(options.onError as any)(error, variables, context, ...rest)
      }
    }
  })
}

/**
 * React Query hook for updating an existing product.
 */
export function useUpdateProductMutation(
  options?: UseMutationOptions<
    ProductResponse,
    Error,
    { id: number | string; payload: ProductUpdateRequest }
  >
) {
  const queryClient = useQueryClient()

  return useMutation({
    ...options,
    mutationFn: ({ id, payload }: { id: number | string; payload: ProductUpdateRequest }) =>
      updateProduct(id, payload),
    onSuccess: (data, variables, context, ...rest) => {
      queryClient.invalidateQueries({ queryKey: productKeys.all })
      if (options?.onSuccess) {
        ;(options.onSuccess as any)(data, variables, context, ...rest)
      }
    },
    onError: (error: any, variables, context, ...rest) => {
      console.error('Update product error:', error)
      const errorMsg = error?.response?.data?.message || error?.message || 'toasts.error'
      showToast('error', errorMsg)
      if (options?.onError) {
        ;(options.onError as any)(error, variables, context, ...rest)
      }
    }
  })
}

/**
 * React Query hook for deleting a product.
 */
export function useDeleteProductMutation(
  options?: UseMutationOptions<void, Error, number | string>
) {
  const queryClient = useQueryClient()

  return useMutation({
    ...options,
    mutationFn: (productId: number | string) => deleteProduct(productId),
    onSuccess: (data, variables, context, ...rest) => {
      queryClient.invalidateQueries({ queryKey: productKeys.all })
      if (options?.onSuccess) {
        ;(options.onSuccess as any)(data, variables, context, ...rest)
      }
    },
    onError: (error: any, variables, context, ...rest) => {
      console.error('Delete product error:', error)
      const errorMsg = error?.response?.data?.message || error?.message || 'toasts.error'
      showToast('error', errorMsg)
      if (options?.onError) {
        ;(options.onError as any)(error, variables, context, ...rest)
      }
    }
  })
}

export default useProductDetailQuery
