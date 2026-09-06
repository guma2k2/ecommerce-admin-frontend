import React from "react"
import { Tag, ChevronDown } from "lucide-react"
import { Checkbox } from "~/core/components/shadcn/checkbox"
import { Button } from "~/core/components/shadcn/button"
import { Input } from "~/core/components/shadcn/input"
import FileUpload from "~/shared/components/FileUpload"
import PriceInput from "~/shared/components/PriceInput"
import { cn } from "~/shared/utils/appUtils"

export interface VariantRowItem {
  id?: number | null
  title?: string
  sku?: string
  price: number
  quantity: number
  image?: string
  mediaId?: string | null
  attributes?: {
    productAttributeId: number
    name?: string
    value: string
  }[]
}

export interface ProductVariantRowProps {
  index: number
  variant: VariantRowItem
  isSelected: boolean
  variantAttributes?: { productAttributeId: number; name?: string }[]
  isExpanded?: boolean
  onToggleExpand?: () => void
  onSelect: (checked: boolean) => void
  onImageChange: (url: string, mediaId?: string) => void
  onSkuChange: (sku: string) => void
  onPriceChange: (price: number) => void
  onQuantityChange: (quantity: number) => void
}

export default function ProductVariantRow({
  index,
  variant,
  isSelected,
  variantAttributes = [],
  isExpanded = false,
  onToggleExpand,
  onSelect,
  onImageChange,
  onSkuChange,
  onPriceChange,
  onQuantityChange
}: ProductVariantRowProps) {
  const totalAttrs = variantAttributes.length
  const configuredCount = variantAttributes.filter((va) => {
    const found = variant.attributes?.find(
      (a) => Number(a.productAttributeId) === Number(va.productAttributeId)
    )
    return Boolean(found?.value?.trim())
  }).length

  return (
    <tr
      className={cn(
        "hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors",
        isSelected && "bg-primary/5",
        isExpanded && "bg-indigo-50/30 dark:bg-indigo-950/20"
      )}
    >
      <td className="py-2.5 px-3">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelect(!!checked)}
        />
      </td>
      <td className="py-2 px-3">
        <div className="w-10 h-10 rounded-lg border overflow-hidden bg-gray-50 dark:bg-zinc-800 shrink-0">
          <FileUpload
            variant="compact"
            mediaDialog={true}
            value={variant.image || ""}
            onChange={onImageChange}
          />
        </div>
      </td>
      <td className="py-2.5 px-3 font-medium text-gray-900 dark:text-gray-100 min-w-[150px]">
        <div className="flex flex-col">
          <span>{variant.title || `Variant ${index + 1}`}</span>
          {variant.id && (
            <span className="text-[10px] text-muted-foreground font-mono">
              #id:{variant.id}
            </span>
          )}
        </div>
      </td>
      <td className="py-2 px-3 w-36 min-w-[130px]">
        <Input
          value={variant.sku || ""}
          onChange={(e) => onSkuChange(e.target.value)}
          placeholder="SKU"
          className="h-8 font-mono text-xs bg-transparent"
        />
      </td>
      <td className="py-2 px-3 w-28 min-w-[100px]">
        <PriceInput
          value={variant.price ?? 0}
          onChange={onPriceChange}
          placeholder="0.00"
          className="h-8 text-xs bg-transparent font-medium"
        />
      </td>
      <td className="py-2 px-3 w-24 min-w-[80px]">
        <Input
          type="number"
          min="0"
          value={variant.quantity ?? 0}
          onChange={(e) => onQuantityChange(parseInt(e.target.value, 10) || 0)}
          className="h-8 text-xs bg-transparent"
        />
      </td>

      {/* Specifications Trigger Column */}
      {totalAttrs > 0 && (
        <td className="py-2 px-3 min-w-[140px]">
          <Button
            type="button"
            variant={configuredCount > 0 ? "outline" : "ghost"}
            size="sm"
            onClick={onToggleExpand}
            className={cn(
              "h-8 px-2.5 text-xs font-medium gap-1.5 transition-all select-none w-full justify-between",
              configuredCount > 0
                ? "border-indigo-200 bg-indigo-50/60 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800"
                : "text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 border border-dashed border-gray-200 dark:border-zinc-700",
              isExpanded && "ring-1 ring-indigo-500 border-indigo-300 bg-indigo-50 dark:bg-indigo-950/70"
            )}
            title="Click to view and edit specifications"
          >
            <span className="flex items-center gap-1.5 truncate">
              <Tag className="size-3 text-indigo-500 shrink-0" />
              <span className="truncate">
                {configuredCount > 0 ? `${configuredCount}/${totalAttrs} set` : `Specs (${totalAttrs})`}
              </span>
            </span>
            <ChevronDown
              className={cn(
                "size-3 text-muted-foreground transition-transform duration-200 shrink-0",
                isExpanded && "rotate-180 text-indigo-600 dark:text-indigo-400"
              )}
            />
          </Button>
        </td>
      )}
    </tr>
  )
}
