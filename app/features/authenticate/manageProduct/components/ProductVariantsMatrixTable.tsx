import React, { useState } from "react"
import { Tag, Copy, Sliders, ChevronDown, ChevronUp, Check } from "lucide-react"
import { Checkbox } from "~/core/components/shadcn/checkbox"
import { Button } from "~/core/components/shadcn/button"
import { Input } from "~/core/components/shadcn/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "~/core/components/shadcn/select"
import PriceInput from "~/shared/components/PriceInput"
import ProductVariantRow, { type VariantRowItem } from "./ProductVariantRow"

export interface ProductVariantsMatrixTableProps {
  variants: VariantRowItem[]
  selectedIndices: number[]
  variantAttributes?: { productAttributeId: number; name?: string }[]
  onSelectAll: (checked: boolean) => void
  onSelectVariant: (index: number, checked: boolean) => void
  onApplyBulkPrice: (price: number) => void
  onApplyBulkStock: (stock: number) => void
  onApplyBulkAttribute?: (productAttributeId: number, name: string, value: string) => void
  onCopyAttributesToSelected?: (sourceVariantIndex: number) => void
  onUpdateVariantField: (index: number, field: string, value: string | number | null) => void
  onUpdateVariantAttribute?: (
    variantIndex: number,
    productAttributeId: number,
    name: string,
    val: string
  ) => void
}

export default function ProductVariantsMatrixTable({
  variants,
  selectedIndices,
  variantAttributes = [],
  onSelectAll,
  onSelectVariant,
  onApplyBulkPrice,
  onApplyBulkStock,
  onApplyBulkAttribute,
  onCopyAttributesToSelected,
  onUpdateVariantField,
  onUpdateVariantAttribute
}: ProductVariantsMatrixTableProps) {
  const [bulkPrice, setBulkPrice] = useState("")
  const [bulkStock, setBulkStock] = useState("")

  // State for expanded variant specification sub-rows
  const [expandedIndices, setExpandedIndices] = useState<Set<number>>(new Set())

  // State for bulk attribute application
  const [bulkAttrId, setBulkAttrId] = useState<string>(
    variantAttributes[0] ? String(variantAttributes[0].productAttributeId) : ""
  )
  const [bulkAttrVal, setBulkAttrVal] = useState("")

  const handleApplyPrice = () => {
    const p = parseFloat(bulkPrice)
    if (isNaN(p) || p < 0) return
    onApplyBulkPrice(p)
    setBulkPrice("")
  }

  const handleApplyStock = () => {
    const q = parseInt(bulkStock, 10)
    if (isNaN(q) || q < 0) return
    onApplyBulkStock(q)
    setBulkStock("")
  }

  const handleApplyBulkAttr = () => {
    if (!bulkAttrId || !bulkAttrVal.trim() || !onApplyBulkAttribute) return
    const targetAttr = variantAttributes.find((a) => String(a.productAttributeId) === bulkAttrId)
    if (!targetAttr) return
    onApplyBulkAttribute(targetAttr.productAttributeId, targetAttr.name || "", bulkAttrVal.trim())
    setBulkAttrVal("")
  }

  const toggleExpand = (index: number) => {
    setExpandedIndices((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  const toggleExpandAll = () => {
    if (expandedIndices.size === variants.length) {
      setExpandedIndices(new Set())
    } else {
      setExpandedIndices(new Set(variants.map((_, i) => i)))
    }
  }

  const totalAttrs = variantAttributes.length
  const allExpanded = variants.length > 0 && expandedIndices.size === variants.length
  const colSpan = totalAttrs > 0 ? 7 : 6

  return (
    <div className="space-y-3 pt-2">
      {/* Bulk Actions Toolbar */}
      <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-800 space-y-2.5 shadow-2xs">
        {/* Row 1: Selection count, Bulk Price, Bulk Stock, Expand All */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={variants.length > 0 && selectedIndices.length === variants.length}
              onCheckedChange={(c) => onSelectAll(!!c)}
            />
            <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
              {selectedIndices.length > 0
                ? `${selectedIndices.length} of ${variants.length} selected`
                : `Total ${variants.length} SKU(s)`}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1">
              <PriceInput
                placeholder="Bulk Price ($)"
                value={bulkPrice ? parseFloat(bulkPrice) : ""}
                onChange={(val) => setBulkPrice(val ? String(val) : "")}
                className="h-8 w-28 bg-white dark:bg-zinc-900 text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleApplyPrice}
                className="h-8 px-2.5 text-xs font-medium"
              >
                Apply
              </Button>
            </div>

            <div className="flex items-center gap-1">
              <Input
                type="number"
                placeholder="Bulk Stock"
                value={bulkStock}
                onChange={(e) => setBulkStock(e.target.value)}
                className="h-8 w-24 bg-white dark:bg-zinc-900 text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleApplyStock}
                className="h-8 px-2.5 text-xs font-medium"
              >
                Apply
              </Button>
            </div>

            {totalAttrs > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={toggleExpandAll}
                className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
              >
                {allExpanded ? (
                  <>
                    <ChevronUp className="size-3.5" />
                    <span>Collapse All</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="size-3.5" />
                    <span>Expand All Specs</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Row 2: Bulk Attribute Fill for Selected Variants */}
        {totalAttrs > 0 && onApplyBulkAttribute && (
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-gray-200/80 dark:border-zinc-700/80">
            <div className="flex items-center gap-1.5 text-xs text-indigo-700 dark:text-indigo-400 font-medium">
              <Sliders className="size-3.5" />
              <span>Bulk Set Specification:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={bulkAttrId || (variantAttributes[0] ? String(variantAttributes[0].productAttributeId) : "")}
                onValueChange={setBulkAttrId}
              >
                <SelectTrigger className="h-8 min-w-[150px] bg-white dark:bg-zinc-900 text-xs border-gray-200 dark:border-zinc-700">
                  <SelectValue placeholder="Select attribute" />
                </SelectTrigger>
                <SelectContent>
                  {variantAttributes.map((attr) => (
                    <SelectItem
                      key={attr.productAttributeId}
                      value={String(attr.productAttributeId)}
                      className="text-xs"
                    >
                      {attr.name || `Attr #${attr.productAttributeId}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="Value across selected variants..."
                value={bulkAttrVal}
                onChange={(e) => setBulkAttrVal(e.target.value)}
                className="h-8 w-48 sm:w-56 bg-white dark:bg-zinc-900 text-xs border-gray-200 dark:border-zinc-700"
              />

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!bulkAttrVal.trim() || selectedIndices.length === 0}
                onClick={handleApplyBulkAttr}
                className="h-8 px-3 text-xs font-medium text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
              >
                Apply to ({selectedIndices.length})
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Clean Table Container (Zero Horizontal Scroll) */}
      <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50/80 dark:bg-zinc-800/50 text-gray-600 dark:text-gray-400 font-semibold border-b border-gray-200 dark:border-zinc-800 select-none">
            <tr>
              <th className="py-2.5 px-3 w-8"></th>
              <th className="py-2.5 px-3 w-14">Image</th>
              <th className="py-2.5 px-3 min-w-[150px]">Variant Combination</th>
              <th className="py-2.5 px-3 w-36">SKU *</th>
              <th className="py-2.5 px-3 w-28">Price ($) *</th>
              <th className="py-2.5 px-3 w-24">Available *</th>
              {totalAttrs > 0 && (
                <th className="py-2.5 px-3 min-w-[140px]">
                  <span className="flex items-center gap-1">
                    <Tag className="size-3 text-indigo-500" />
                    Specifications
                  </span>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
            {variants.map((v, index) => {
              const isSelected = selectedIndices.includes(index)
              const isExpanded = expandedIndices.has(index)
              const configuredCount = variantAttributes.filter((va) => {
                const found = v.attributes?.find(
                  (a) => Number(a.productAttributeId) === Number(va.productAttributeId)
                )
                return Boolean(found?.value?.trim())
              }).length

              return (
                <React.Fragment key={index}>
                  {/* Main Variant Row */}
                  <ProductVariantRow
                    index={index}
                    variant={v}
                    isSelected={isSelected}
                    variantAttributes={variantAttributes}
                    isExpanded={isExpanded}
                    onToggleExpand={() => toggleExpand(index)}
                    onSelect={(checked) => onSelectVariant(index, checked)}
                    onImageChange={(url, mediaId) => {
                      onUpdateVariantField(index, "image", url)
                      if (mediaId !== undefined) {
                        onUpdateVariantField(index, "mediaId", mediaId)
                      }
                    }}
                    onSkuChange={(sku) => onUpdateVariantField(index, "sku", sku)}
                    onPriceChange={(price) => onUpdateVariantField(index, "price", price)}
                    onQuantityChange={(qty) => onUpdateVariantField(index, "quantity", qty)}
                  />

                  {/* Expandable Specifications Sub-Row Accordion */}
                  {isExpanded && totalAttrs > 0 && (
                    <tr className="bg-indigo-50/20 dark:bg-indigo-950/15 border-b border-gray-200 dark:border-zinc-800">
                      <td colSpan={colSpan} className="py-3 px-4 pl-12">
                        <div className="rounded-xl border border-indigo-100 dark:border-indigo-900/60 bg-white dark:bg-zinc-900 p-4 space-y-3.5 shadow-2xs">
                          {/* Sub-row Header */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-gray-100 dark:border-zinc-800">
                            <div className="flex items-center gap-2">
                              <div className="size-6 rounded-md bg-indigo-50 dark:bg-indigo-950/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                <Tag className="size-3.5" />
                              </div>
                              <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                                Specifications for {v.title || `Variant ${index + 1}`}
                              </span>
                              <span className="text-[11px] text-muted-foreground font-mono">
                                ({configuredCount} of {totalAttrs} configured)
                              </span>
                            </div>

                            {/* Shortcut: Copy to other selected variants */}
                            {configuredCount > 0 && variants.length > 1 && onCopyAttributesToSelected && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => onCopyAttributesToSelected(index)}
                                className="h-7 px-2.5 text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 gap-1.5 font-medium"
                                title="Copy these specifications to other variants"
                              >
                                <Copy className="size-3" />
                                <span>
                                  Copy to {selectedIndices.length > 0 ? "selected variants" : "all other variants"}
                                </span>
                              </Button>
                            )}
                          </div>

                          {/* Attributes Grid Input Cards */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {variantAttributes.map((attr) => {
                              const currentAttr = v.attributes?.find(
                                (a) => Number(a.productAttributeId) === Number(attr.productAttributeId)
                              )
                              const val = currentAttr?.value || ""

                              return (
                                <div
                                  key={attr.productAttributeId}
                                  className="space-y-1.5 p-2.5 rounded-lg bg-gray-50/70 dark:bg-zinc-800/40 border border-gray-200/80 dark:border-zinc-800"
                                >
                                  <div className="flex items-center justify-between text-[11px] font-medium text-gray-700 dark:text-gray-300">
                                    <label className="flex items-center gap-1.5 truncate" title={attr.name}>
                                      <Tag className="size-3 text-indigo-500 shrink-0" />
                                      <span className="truncate font-semibold">
                                        {attr.name || `Attr #${attr.productAttributeId}`}
                                      </span>
                                    </label>
                                    {val && (
                                      <span className="flex items-center gap-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                                        <Check className="size-2.5" />
                                        Set
                                      </span>
                                    )}
                                  </div>
                                  <Input
                                    placeholder={`Enter ${attr.name || "specification"}...`}
                                    value={val}
                                    onChange={(e) =>
                                      onUpdateVariantAttribute?.(
                                        index,
                                        attr.productAttributeId,
                                        attr.name || "",
                                        e.target.value
                                      )
                                    }
                                    className="h-8 text-xs bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700"
                                  />
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
