import { closestCenter, DndContext, type DragEndEvent } from '@dnd-kit/core'
import { arrayMove, rectSortingStrategy, SortableContext } from '@dnd-kit/sortable'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { FormInput } from '~/components/Form'
import { Field, FieldContent, FieldGroup, FieldLabel } from '~/components/ui/field'
import { productFormSchema, type ProductFormSchema } from '~/features/authenticate/manageProduct/validator'
import SortableImage from '~/features/authenticate/manageProduct/components/SortableImage'
import Upload from '~/components/Upload'

export default function ProductInformationForm() {
  const form = useForm<ProductFormSchema>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      title: '',
      description: '',
      medias: []
    }
  })
  const { handleSubmit, control, watch, setValue } = form
  const { fields, append, remove } = useFieldArray({
    control: control,
    name: 'medias'
  })
  const onSubmit = (values: ProductFormSchema) => {}
  const medias = watch('medias')
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = medias.findIndex((i) => i.id === active.id)
    const newIndex = medias.findIndex((i) => i.id === over.id)
    const newMedias = arrayMove(medias, oldIndex, newIndex)
    setValue('medias', newMedias)
  }
  const renderUpload = (field: any, index: number) => {
    return (
      <Controller
        key={field.id}
        name={`medias.${index}.url`}
        control={control}
        render={({ field: controllerField, fieldState }) => (
          <Field orientation='horizontal' data-invalid={fieldState.invalid}>
            <FieldContent></FieldContent>
          </Field>
        )}
      />
    )
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <FormInput control={control} name='title' label='Title' />
        <FieldContent>
          <FieldLabel>Media</FieldLabel>
          <div className='w-40 h-40'>
            <Upload />
          </div>
          {/* <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={medias.map((i) => i.id)} strategy={rectSortingStrategy}>
              {medias.length > 0 && (
                <>
                  <div className='grid grid-cols-12 gap-4'>
                    <div className='col-span-12 md:col-span-4'>
                      <SortableImage image={medias[0]} />
                    </div>
                    <div className='col-span-12 md:col-span-8'>
                      <div className='grid grid-cols-4 grid-rows-2 gap-3 h-full'>
                        {medias.slice(1, 9).map((img, i) => (
                          <SortableImage key={img.id} image={img} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className='grid grid-cols-6 gap-4'>
                    {medias.slice(9).map((img, i) => (
                      <SortableImage key={img.id} image={img} />
                    ))}
                  </div>
                </>
              )}
            </SortableContext>
          </DndContext> */}
        </FieldContent>
      </FieldGroup>
    </form>
  )
}
