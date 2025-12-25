import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
type SortableImageProps = {
  image: { id: string; url: string }
}
export default function SortableImage({ image }: SortableImageProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: image.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className='rounded-lg overflow-hidden border cursor-grab active:cursor-grabbing'
    >
      <img src={image.url} alt='Image' className='w-full h-full object-cover aspect-square' />
    </div>
  )
}
