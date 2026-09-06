import React, { useState } from "react"
import {
  closestCenter,
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Database, GripVertical, Tag } from "lucide-react"
import { Button } from "~/core/components/shadcn/button"
import { Input } from "~/core/components/shadcn/input"
import InfiniteSelect from "~/shared/components/InfiniteSelect"
import { getOptionsPage } from "~/shared/services/api/productOptionService"
import type { ProductOptionResponse } from "~/shared/types"
import { cn } from "~/shared/utils/appUtils"
import SortableOptionValueItem from "./SortableOptionValueItem"

export interface OptionValueItem {
  id?: number | null
  value: string
  position?: number
  _key?: string
}

export interface OptionAxisItem {
  id?: number | string | null
  productOptionId?: number
  name: string
  position?: number
  showing?: boolean
  values: OptionValueItem[]
}

export interface SortableOptionAxisCardProps {
  fieldId: string
  optIdx: number
  option: OptionAxisItem
  onUpdateName: (name: string, productOptionId?: number) => void
  onAddValue: (value: string) => void
  onUpdateValue: (valIdx: number, value: string) => void
  onRemoveValue: (valIdx: number) => void
  onReorderValues: (oldIndex: number, newIndex: number) => void
  onRemoveOption: () => void
  onToggleShowing: (showing: boolean) => void
  disabledOptionNames?: string[]
}

const COLOR_MAP: Record<string, string> = {
  blue: "#2563eb",
  white: "#ffffff",
  black: "#000000",
  red: "#dc2626",
  green: "#16a34a",
  yellow: "#eab308",
  orange: "#f97316",
  purple: "#a855f7",
  pink: "#ec4899",
  gray: "#6b7280",
  grey: "#6b7280",
  navy: "#1e3a8a",
  brown: "#78350f",
  beige: "#f5f5dc"
}

function getColorHex(val: string): string | null {
  const clean = val.trim().toLowerCase()
  if (COLOR_MAP[clean]) return COLOR_MAP[clean]
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(clean)) return clean
  return null
}

function SortableOptionAxisCardComponent({
  fieldId,
  optIdx,
  option,
  onUpdateName,
  onAddValue,
  onUpdateValue,
  onRemoveValue,
  onReorderValues,
  onRemoveOption,
  onToggleShowing,
  disabledOptionNames
}: SortableOptionAxisCardProps) {
  const [newValInput, setNewValInput] = useState("")
  const [activeValueId, setActiveValueId] = useState<string | null>(null)

  // Outer sortable hook for this option card
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: fieldId
  })

  // Inner sensors for drag-and-drop of option values
  const innerSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const cardStyle: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition: isDragging ? undefined : transition,
    zIndex: isDragging ? 50 : 1
  }

  const isShowing = option.showing !== false
  const isColorOption =
    option.name?.toLowerCase().includes("color") || option.name?.toLowerCase().includes("colour")

  // Generate stable IDs for option values
  const valueItems = (option.values || []).map((v, valIdx) => ({
    ...v,
    id: v._key || (v.id != null ? `val-id-${v.id}` : `opt-${optIdx}-val-${valIdx}`)
  }))

  const handleValueDragStart = (e: DragStartEvent) => {
    setActiveValueId(e.active.id as string)
  }

  const handleValueDragEnd = (event: DragEndEvent) => {
    setActiveValueId(null)
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = valueItems.findIndex((item) => item.id === active.id)
    const newIndex = valueItems.findIndex((item) => item.id === over.id)

    if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
      onReorderValues(oldIndex, newIndex)
    }
  }

  const handleAddNewValue = () => {
    const trimmed = newValInput.trim()
    if (!trimmed) return
    onAddValue(trimmed)
    setNewValInput("")
  }

  const activeValueItem = valueItems.find((v) => v.id === activeValueId)

  // COLLAPSED VIEW (Image 1 Style List Row)
  if (!isShowing) {
    return (
      <div
        ref={setNodeRef}
        style={cardStyle}
        onClick={() => onToggleShowing(true)}
        className={cn(
          "p-4 sm:px-5 sm:py-3.5 bg-white dark:bg-zinc-900 hover:bg-gray-50/80 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors relative flex items-center justify-between gap-4 select-none group",
          isDragging && "opacity-30 bg-gray-50 dark:bg-zinc-800"
        )}
      >
        <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
          <button
            type="button"
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 cursor-grab active:cursor-grabbing p-1 -ml-1 rounded focus:outline-none transition-colors shrink-0 touch-none select-none"
            title="Drag to reorder option"
          >
            <GripVertical className="size-4" />
          </button>

          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-primary transition-colors">
              {option.name || "Untitled Option"}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {option.values
                ?.filter((v) => v.value && v.value.trim())
                .map((val, idx) => {
                  const colorHex = isColorOption ? getColorHex(val.value) : null
                  return (
                    <span
                      key={idx}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium shadow-2xs border transition-colors",
                        colorHex
                          ? "bg-blue-50/50 dark:bg-blue-950/20 text-gray-800 dark:text-gray-200 border-blue-100 dark:border-blue-900/40"
                          : "bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 border-gray-200/80 dark:border-zinc-700/80"
                      )}
                    >
                      {colorHex && (
                        <span
                          className="size-3.5 rounded-xs border border-black/15 shrink-0 shadow-2xs"
                          style={{ backgroundColor: colorHex }}
                        />
                      )}
                      {val.value}
                    </span>
                  )
                })}
              {(!option.values || option.values.filter((v) => v.value && v.value.trim()).length === 0) && (
                <span className="text-xs text-muted-foreground italic">No values configured</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="size-8 rounded-lg flex items-center justify-center text-blue-500 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/30 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
            <Database className="size-4" />
          </div>
        </div>
      </div>
    )
  }

  // EDIT MODE (Image 1 Style Expanded Form)
  return (
    <div
      ref={setNodeRef}
      style={cardStyle}
      className={cn(
        "p-5 bg-white dark:bg-zinc-900 space-y-4 relative",
        isDragging && "opacity-30 bg-gray-50 dark:bg-zinc-800"
      )}
    >
      {/* Option Name Section */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Option name
          </label>
          <div className="size-7 rounded-md flex items-center justify-center text-blue-500 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/30">
            <Database className="size-3.5" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 cursor-grab active:cursor-grabbing p-1 -ml-1 rounded focus:outline-none transition-colors shrink-0 touch-none select-none"
            title="Drag to reorder option"
          >
            <GripVertical className="size-4" />
          </button>

          <div className="flex-1 min-w-0">
            <InfiniteSelect<ProductOptionResponse>
              fetchData={getOptionsPage}
              value={option.name || ""}
              onChange={(val, item) =>
                onUpdateName(val, item?.id ? Number(item.id) : undefined)
              }
              getOptionValue={(item) => item.name}
              getOptionLabel={(item) => item.name}
              disabledOptionIds={disabledOptionNames}
              disabledOptionBadge="Added"
              placeholder="Select option (e.g. Size, Color, Material)"
              searchPlaceholder="Search option name..."
              triggerClassName="h-9 text-xs"
              renderOption={(item) => (
                <div className="flex items-center justify-between w-full pr-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Tag className="size-3.5 text-primary shrink-0" />
                    <span className="font-medium truncate">{item.name}</span>
                  </div>
                  <span className="text-[11px] font-mono text-muted-foreground shrink-0 ml-2">
                    {item.id}
                  </span>
                </div>
              )}
            />
          </div>
        </div>
      </div>

      {/* Option Values Section */}
      <div className="space-y-2 pt-1">
        <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block">
          Option values
        </label>

        {/* Sortable List of Values */}
        {valueItems.length > 0 && (
          <DndContext
            sensors={innerSensors}
            collisionDetection={closestCenter}
            onDragStart={handleValueDragStart}
            onDragEnd={handleValueDragEnd}
            onDragCancel={() => setActiveValueId(null)}
          >
            <SortableContext
              items={valueItems.map((v) => v.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {valueItems.map((valItem, valIdx) => (
                  <SortableOptionValueItem
                    key={valItem.id}
                    id={valItem.id}
                    value={valItem.value}
                    index={valIdx}
                    optionIndex={optIdx}
                    onChange={(newVal) => onUpdateValue(valIdx, newVal)}
                    onRemove={() => onRemoveValue(valIdx)}
                  />
                ))}
              </div>
            </SortableContext>

            <DragOverlay dropAnimation={{ duration: 150, easing: "ease" }}>
              {activeValueItem ? (
                <div className="flex items-center gap-2 w-full p-2 bg-white dark:bg-zinc-900 border border-primary/40 rounded-lg shadow-lg">
                  <GripVertical className="size-4 text-primary shrink-0 ml-1" />
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100 px-2">
                    {activeValueItem.value || "New Value"}
                  </span>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}

        {/* Add Another Value Input */}
        <div className="pl-6 pt-0.5">
          <Input
            value={newValInput}
            onChange={(e) => setNewValInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleAddNewValue()
              }
            }}
            onBlur={handleAddNewValue}
            placeholder="Add another value"
            className="h-9 w-full bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 shadow-2xs focus-visible:ring-1"
          />
        </div>
      </div>

      {/* Bottom Action Bar: Delete (Left) & Done (Right) */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-zinc-800/80">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRemoveOption}
          className="text-red-600 dark:text-red-400 border-gray-200 dark:border-zinc-700 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-200 dark:hover:border-red-900 rounded-lg px-4 h-8 text-xs font-semibold"
        >
          Delete
        </Button>

        <Button
          type="button"
          size="sm"
          onClick={() => onToggleShowing(false)}
          className="bg-zinc-900 hover:bg-black text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 rounded-lg px-5 h-8 text-xs font-semibold shadow-xs"
        >
          Done
        </Button>
      </div>
    </div>
  )
}

export default React.memo(SortableOptionAxisCardComponent)
