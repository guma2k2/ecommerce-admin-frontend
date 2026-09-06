import React, { useEffect, useMemo, useState } from 'react'
import {
  closestCenter,
  DndContext,
  DragOverlay,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { zodResolver } from '@hookform/resolvers/zod'
import { PlusCircle } from 'lucide-react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import FormBase from '~/shared/components/Form'
import FileUpload from '~/shared/components/FileUpload'
import { Button } from '~/core/components/shadcn/button'
import { Input } from '~/core/components/shadcn/input'
import ProductOptionDragPreview from '~/features/authenticate/manageProduct/components/ProductOptionDragPreview'
import SortableProductOption from '~/features/authenticate/manageProduct/components/SortableProductOption'
import { ProductVariantFormProvider } from '~/features/authenticate/manageProduct/contexts/ProductVariantFormContext'
import {
  productVariantFormSchema,
  type ProductVariantFormSchema
} from '~/features/authenticate/manageProduct/validator'
import { cartesian } from '~/shared/utils/appUtils'

export default function ProductVariantForm() {
  const [activeId, setActiveId] = useState<string | null>(null)

  const form = useForm<ProductVariantFormSchema>({
    resolver: zodResolver(productVariantFormSchema),
    defaultValues: {
      options: [],
      variants: []
    }
  })
  const { control, getValues, setValue } = form
  const {
    fields: productOptionFields,
    append: appendOption,
    remove: removeOption,
    update: updateOption,
    move
  } = useFieldArray({
    control: control,
    name: 'options'
  })

  const { fields: productVariantFields } = useFieldArray({
    control: control,
    name: 'variants'
  })

  const productOptions = useWatch({ control, name: 'options' }) || []
  const productVariants = useWatch({ control, name: 'variants' }) || []

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleCreateOption = () => {
    const optionLength = productOptionFields.length + 1
    appendOption({
      name: '',
      showing: true,
      position: optionLength,
      values: []
    })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = productOptionFields.findIndex((i) => i.id === active.id)
    const newIndex = productOptionFields.findIndex((i) => i.id === over.id)
    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return

    move(oldIndex, newIndex)

    const reordered = arrayMove(getValues('options') ?? [], oldIndex, newIndex)
    setValue(
      'options',
      reordered.map((item, i) => ({ ...item, position: i + 1 })),
      { shouldDirty: true }
    )
  }

  const handleRemoveOption = (optionIndex: number) => {
    removeOption(optionIndex)
    const reordered = getValues('options') ?? []
    setValue(
      'options',
      reordered.map((item, i) => ({ ...item, position: i + 1 })),
      { shouldDirty: true }
    )
  }

  const buildVariants = (options: { name: string; values: string[] }[]) => {
    if (!options.length) return []

    const valueMatrix = options.map((o) => o.values)
    const combinations = cartesian(valueMatrix)
    return combinations.map((values) => ({
      image: '',
      name: values.join(' / '),
      title: values.join(' / '),
      sku: `SKU-${values.join('-')}`,
      price: 0,
      quantity: 0
    }))
  }

  const handleChangeProductImage = (index: number, url: string) => {
    setValue(`variants.${index}.image`, url)
  }

  const productOptionsJson = JSON.stringify(productOptions)

  useEffect(() => {
    const normalized = productOptions
      .filter((o) => o.name?.trim())
      .map((o) => ({
        name: o.name.trim(),
        values: (o.values || []).map((v) => v.value?.trim()).filter(Boolean)
      }))
    const variants = buildVariants(normalized)
    setValue('variants', variants, { shouldDirty: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productOptionsJson])

  const contextValue = useMemo(
    () => ({
      productOptionFields,
      control,
      getValues,
      setValue,
      updateOption,
      removeOption: handleRemoveOption
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [productOptionFields, control]
  )

  return (
    <div className='space-y-5'>
      <div className='flex items-center justify-between'>
        <h4 className='text-sm font-semibold text-gray-800 dark:text-gray-200'>Variants & Options</h4>
        <Button variant={'outline'} size={'sm'} onClick={handleCreateOption} className='h-8 text-xs gap-1.5'>
          <PlusCircle className='size-3.5' />
          Add options like size or color
        </Button>
      </div>

      <div className='border border-gray-200 dark:border-zinc-800 rounded-xl p-4 bg-white dark:bg-zinc-900 shadow-xs space-y-4'>
        <ProductVariantFormProvider value={contextValue}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={(e) => setActiveId(e.active.id as string)}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setActiveId(null)}
          >
            <SortableContext items={productOptionFields.map((i) => i.id)} strategy={verticalListSortingStrategy}>
              <div className='space-y-3'>
                {productOptionFields.map((field, index) => (
                  <SortableProductOption key={field.id} field={field} index={index} />
                ))}
              </div>
              <DragOverlay adjustScale={false} dropAnimation={{ duration: 150, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
                {activeId ? <ProductOptionDragPreview optionId={activeId} /> : null}
              </DragOverlay>
            </SortableContext>
          </DndContext>
        </ProductVariantFormProvider>

        {productOptionFields.length === 0 && (
          <div className='text-center py-6 text-xs text-muted-foreground'>
            No options added yet. Click &quot;Add options like size or color&quot; above.
          </div>
        )}
      </div>

      {productVariants.length > 0 && (
        <div className='space-y-3'>
          <div className='grid grid-cols-12 text-xs font-semibold text-gray-600 dark:text-gray-400 px-3'>
            <div className='col-span-6'>Variant</div>
            <div className='col-span-4'>Price</div>
            <div className='col-span-2'>Available</div>
          </div>

          <div className='space-y-2'>
            {productVariantFields.map((field, index) => (
              <div
                className='grid grid-cols-12 gap-3 items-center p-2.5 rounded-lg border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs'
                key={field.id}
              >
                <div className='col-span-6 flex items-center gap-3'>
                  <div className='size-10 rounded border overflow-hidden bg-gray-50 dark:bg-zinc-800 shrink-0'>
                    <FileUpload
                      variant='compact'
                      mediaDialog={true}
                      value={productVariants[index]?.image}
                      onChange={(url: string, mediaId?: string) => {
                        handleChangeProductImage(index, url)
                        if (mediaId) {
                          setValue(`variants.${index}.mediaId`, mediaId)
                        }
                      }}
                    />
                  </div>
                  <div className='font-medium text-gray-900 dark:text-gray-100 truncate'>
                    {field.name || field.title || `Variant ${index + 1}`}
                  </div>
                </div>
                <div className='col-span-4'>
                  <FormBase control={control} name={`variants.${index}.price`}>
                    {(f) => <Input {...f} type='number' step='0.01' className='h-8 text-xs' />}
                  </FormBase>
                </div>
                <div className='col-span-2'>
                  <FormBase control={control} name={`variants.${index}.quantity`}>
                    {(f) => <Input {...f} type='number' className='h-8 text-xs' />}
                  </FormBase>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
