import React, { useState } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { Link, useNavigate } from "react-router"
import { ArrowLeft, Save, Loader2, PackagePlus, Edit3 } from "lucide-react"
import { Button } from "~/core/components/shadcn/button"
import { Badge } from "~/core/components/shadcn/badge"
import { showToast } from "~/shared/utils/toast"
import {
  productFormSchema,
  type ProductFormSchema,
  type ProductAttributeItemForm
} from "~/features/authenticate/manageProduct/validator"
import ProductGeneralInfoCard from "./ProductGeneralInfoCard"
import ProductMediaCard from "./ProductMediaCard"
import ProductVariantCard from "./ProductVariantCard"
import ProductClassificationCard from "./ProductClassificationCard"
import ProductAttributesCard from "./ProductAttributesCard"
import ProductSeoCard from "./ProductSeoCard"
import type {
  ProductResponse,
  CategoryItem,
  BrandItem,
  ProductCreateRequest,
  ProductUpdateRequest
} from "~/shared/types"

interface ProductFormProps {
  mode: "create" | "edit"
  initialData?: ProductResponse | null
  categories?: CategoryItem[]
  brands?: BrandItem[]
  onSubmit?: (values: ProductCreateRequest | ProductUpdateRequest) => Promise<void> | void
  isSubmitting?: boolean
}

export default function ProductForm({
  mode,
  initialData,
  categories,
  brands,
  onSubmit: externalOnSubmit,
  isSubmitting: externalIsSubmitting
}: ProductFormProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [internalIsSubmitting, setInternalIsSubmitting] = useState(false)
  const isSubmitting = externalIsSubmitting !== undefined ? externalIsSubmitting : internalIsSubmitting

  // Map initialData from API to Form State if in edit mode
  const defaultValues: ProductFormSchema = React.useMemo(() => {
    if (!initialData || mode === "create") {
      return {
        name: "",
        slug: "",
        description: "",
        metaTitle: "",
        metaKeyword: "",
        metaDescription: "",
        categoryId: null,
        brandId: null,
        status: "ACTIVE",
        medias: [],
        attributes: [],
        hasOptions: false,
        simplePrice: 0,
        simpleQuantity: 0,
        simpleSku: "",
        options: [],
        variants: [
          {
            id: null,
            title: "Default Title",
            sku: "",
            price: 0,
            quantity: 0
          }
        ]
      }
    }

    const hasOptions = (initialData.options && initialData.options.length > 0) || false
    const firstVariant = initialData.variants?.[0]

    return {
      id: initialData.id,
      name: initialData.name,
      slug: initialData.slug,
      description: initialData.description || "",
      metaTitle: initialData.metaTitle || "",
      metaKeyword: initialData.metaKeyword || "",
      metaDescription: initialData.metaDescription || "",
      categoryId: initialData.categoryId ?? initialData.category?.id ?? null,
      brandId: initialData.brand?.id || null,
      status: "ACTIVE",
      attributeTemplateId: null,
      medias: (initialData.medias || []).map((m) => ({
        mediaId: m.mediaId,
        position: m.position,
        url: m.url || "",
        isChecked: false
      })),
      attributes: (() => {
        const baseAttrs: ProductAttributeItemForm[] = (initialData.attributes || []).map((a) => ({
          id: a.id,
          productAttributeId: a.productAttributeId,
          name: a.name || "",
          value: a.value || "",
          applyTo: "base"
        }))

        const variantAttrMap = new Map<number, { id?: number; productAttributeId: number; name?: string }>()
        ;(initialData.variants || []).forEach((v) => {
          const attrs = v.attributeValues || (v as any).attributes || []
          attrs.forEach((a: any) => {
            if (!variantAttrMap.has(a.productAttributeId)) {
              variantAttrMap.set(a.productAttributeId, {
                id: a.id,
                productAttributeId: a.productAttributeId,
                name: a.name
              })
            }
          })
        })

        const existingBaseIds = new Set(baseAttrs.map((a) => a.productAttributeId))
        const combined: ProductAttributeItemForm[] = [...baseAttrs]
        variantAttrMap.forEach((va, id) => {
          if (!existingBaseIds.has(id)) {
            combined.push({
              productAttributeId: id,
              name: va.name || "",
              value: "",
              applyTo: "variant"
            })
          }
        })
        return combined
      })(),
      hasOptions: hasOptions,
      simplePrice: firstVariant?.price || 0,
      simpleQuantity: firstVariant?.quantity || 0,
      simpleSku: firstVariant?.sku || "",
      options: (initialData.options || []).map((opt) => ({
        id: opt.id,
        productOptionId: opt.productOptionId,
        name: opt.name,
        position: opt.position,
        showing: true,
        values: opt.values.map((v) => ({
          id: v.id,
          value: v.value,
          position: v.position
        }))
      })),
      variants: (initialData.variants || []).map((v) => ({
        id: v.id,
        title: v.title,
        sku: v.sku,
        price: v.price,
        quantity: v.quantity,
        mediaId: v.mediaId || undefined,
        image: v.mediaUrl || initialData.medias?.find((m) => m.mediaId === v.mediaId)?.url || "",
        productOptionValueIds: v.productOptionValueIds,
        attributes: (v.attributeValues || (v as any).attributes || []).map((a: any) => ({
          id: a.id,
          productAttributeId: a.productAttributeId,
          name: a.name || "",
          value: a.value || "",
          applyTo: "variant" as const
        }))
      }))
    }
  }, [initialData, mode])

  const methods = useForm<ProductFormSchema>({
    resolver: zodResolver(productFormSchema),
    defaultValues
  })

  const { handleSubmit, formState } = methods
  const { isDirty } = formState

  const onSubmit = async (values: ProductFormSchema) => {
    try {
      setInternalIsSubmitting(true)

      // 1. Prepare options payload
      const optionsPayload = values.hasOptions
        ? values.options
            .filter((opt) => opt.name.trim() && opt.values.some((v) => v.value.trim()))
            .map((opt, optIndex) => ({
              ...(mode === "edit" && typeof opt.id === "number" ? { id: opt.id } : {}),
              productOptionId: opt.productOptionId || optIndex + 1,
              position: optIndex,
              values: opt.values
                .filter((v) => v.value.trim())
                .map((v) => ({
                  ...(mode === "edit" && typeof v.id === "number" ? { id: v.id } : {}),
                  value: v.value.trim()
                }))
            }))
        : []

      // 2. Prepare variants payload
      const variantsPayload = values.variants.map((v, idx) => {
        const variantAttrs = (v.attributes || [])
          .filter((a) => a.value?.trim())
          .map((a) => ({
            ...(mode === "edit" && typeof a.id === "number" ? { id: a.id } : {}),
            productAttributeId: Number(a.productAttributeId),
            value: a.value.trim()
          }))

        return {
          ...(mode === "edit" && typeof v.id === "number" ? { id: v.id } : {}),
          title: v.title?.trim() || "Default",
          sku: (v.sku || "").trim() || `${values.slug.toUpperCase()}-${idx + 1}`,
          price: Number(v.price) || 0,
          quantity: Number(v.quantity) || 0,
          mediaId: v.mediaId || null,
          attributeValues: variantAttrs
        }
      })

      // 3. Prepare medias payload
      const mediasPayload = values.medias.map((m, pos) => ({
        mediaId: m.mediaId,
        position: pos
      }))

      // 4. Prepare attributes payload for base product
      const attributesPayload = values.attributes
        .filter((a) => a.applyTo !== "variant" && a.value?.trim())
        .map((a) => ({
          ...(mode === "edit" && typeof a.id === "number" ? { id: a.id } : {}),
          productAttributeId: Number(a.productAttributeId),
          value: a.value.trim()
        }))

      if (mode === "create") {
        const createPayload: ProductCreateRequest = {
          name: values.name.trim(),
          slug: values.slug.trim(),
          description: values.description?.trim() || null,
          metaTitle: values.metaTitle?.trim() || null,
          metaKeyword: values.metaKeyword?.trim() || null,
          metaDescription: values.metaDescription?.trim() || null,
          categoryId: values.categoryId ? Number(values.categoryId) : null,
          brandId: values.brandId ? Number(values.brandId) : null,
          medias: mediasPayload,
          options: optionsPayload,
          attributes: attributesPayload,
          variants: variantsPayload
        }

        if (externalOnSubmit) {
          await externalOnSubmit(createPayload)
        }
      } else {
        const updatePayload: ProductUpdateRequest = {
          name: values.name.trim(),
          slug: values.slug.trim(),
          description: values.description?.trim() || null,
          metaTitle: values.metaTitle?.trim() || null,
          metaKeyword: values.metaKeyword?.trim() || null,
          metaDescription: values.metaDescription?.trim() || null,
          categoryId: values.categoryId ? Number(values.categoryId) : null,
          brandId: values.brandId ? Number(values.brandId) : null,
          medias: mediasPayload,
          options: optionsPayload,
          attributes: attributesPayload,
          variants: variantsPayload
        }

        if (externalOnSubmit) {
          await externalOnSubmit(updatePayload)
        }
      }
    } catch (error: unknown) {
      console.error("Failed to save product:", error)
      const errorMsg = (error as { message?: string })?.message || t("product.saveError")
      showToast("error", errorMsg)
    } finally {
      setInternalIsSubmitting(false)
    }
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Sticky Action Header */}
        <div className="sticky top-0 z-40 -mx-6 -mt-6 px-6 py-4 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-gray-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              asChild
              className="h-9 w-9 bg-white dark:bg-zinc-900 shadow-xs border-gray-200 dark:border-zinc-800"
            >
              <Link to="/admin/manage-product">
                <ArrowLeft className="size-4" />
                <span className="sr-only">{t("product.backToProducts")}</span>
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-50 flex items-center gap-2">
                  {mode === "create" ? (
                    <>
                      <PackagePlus className="size-5 text-primary" />
                      {t("product.addNew")}
                    </>
                  ) : (
                    <>
                      <Edit3 className="size-5 text-primary" />
                      {t("product.updateTitle")}: {initialData?.name}
                    </>
                  )}
                </h1>
                {mode === "edit" && initialData?.id && (
                  <Badge variant="secondary" className="font-mono text-xs">
                    #{initialData.id}
                  </Badge>
                )}
                {isDirty && (
                  <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-300">
                    {t("product.unsavedChanges")}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {mode === "create"
                  ? t("product.addSubtitle")
                  : t("product.updateSubtitle")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate("/admin/manage-product")}
              className="h-9 px-4 text-xs font-medium border-gray-300 dark:border-zinc-700"
            >
              {t("product.discard")}
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              size="sm"
              className="h-9 px-5 text-xs font-medium gap-1.5 bg-gray-900 hover:bg-black text-white dark:bg-white dark:text-black dark:hover:bg-gray-200 shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  {t("product.saving")}
                </>
              ) : (
                <>
                  <Save className="size-3.5" />
                  {mode === "create" ? t("product.saveProduct") : t("product.saveChanges")}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* 2-Column Responsive Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Column (8 cols = ~67%) */}
          <div className="lg:col-span-8 space-y-6">
            <ProductGeneralInfoCard />
            <ProductMediaCard />
            <ProductAttributesCard />
            <ProductVariantCard />
            <ProductSeoCard />
          </div>

          {/* Right Column (4 cols = ~33% Sticky) */}
          <div className="lg:col-span-4 space-y-6 sticky top-20">
            <ProductClassificationCard categories={categories} brands={brands} />

            {/* Audit / Summary Card (in Edit Mode) */}
            {mode === "edit" && initialData && (
              <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-5 space-y-3 shadow-xs text-xs">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                  {t("product.productMetadata")}
                </h4>
                <div className="space-y-2 text-muted-foreground">
                  <div className="flex justify-between">
                    <span>{t("product.createdAt")}</span>
                    <span className="font-mono text-gray-700 dark:text-gray-300">
                      {initialData.createdAt ? new Date(initialData.createdAt).toLocaleDateString() : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("product.lastUpdated")}</span>
                    <span className="font-mono text-gray-700 dark:text-gray-300">
                      {initialData.updatedAt ? new Date(initialData.updatedAt).toLocaleDateString() : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("product.totalVariants")}</span>
                    <span className="font-semibold text-primary">
                      {initialData.variants?.length || 0}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </FormProvider>
  )
}
