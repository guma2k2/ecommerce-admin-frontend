import { useState } from "react"
import { useLoaderData, useNavigate, type LoaderFunctionArgs } from "react-router"
import ProductForm from "~/features/authenticate/manageProduct/components/ProductForm"
import { getProductById, updateProduct } from "~/shared/services/api/productService"
import { getAllCategories } from "~/shared/services/api/categoryService"
import { getAllBrands } from "~/shared/services/api/brandService"
import { showToast } from "~/shared/utils/toast"
import type { ProductCreateRequest, ProductUpdateRequest } from "~/shared/types"

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const productId = params.id
  if (!productId) {
    throw new Response("Product ID is required", { status: 400 })
  }

  const [product, categories, brands] = await Promise.all([
    getProductById(productId),
    getAllCategories().catch(() => []),
    getAllBrands().catch(() => [])
  ])
  return { product, categories, brands, productId }
}

clientLoader.hydrate = true as const

export default function UpdateProductPage() {
  const { product, categories, brands, productId } = useLoaderData<typeof clientLoader>()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleUpdate = async (values: ProductCreateRequest | ProductUpdateRequest) => {
    try {
      setIsSubmitting(true)
      const targetId = product?.id || productId
      await updateProduct(targetId, values as ProductUpdateRequest)
      showToast("success", "toasts.updatedSuccess")
      navigate("/admin/manage-product")
    } catch (error: unknown) {
      console.error("Failed to update product:", error)
      const errorMsg = (error as { message?: string })?.message || "toasts.error"
      showToast("error", errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full min-h-screen bg-gray-50/50 dark:bg-zinc-950 p-6">
      <ProductForm
        mode="edit"
        initialData={product}
        categories={categories}
        brands={brands}
        onSubmit={handleUpdate}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}
