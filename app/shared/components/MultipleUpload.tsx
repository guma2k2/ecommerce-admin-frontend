import {
  closestCenter,
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent
} from "@dnd-kit/core"
import { arrayMove, rectSortingStrategy, SortableContext } from "@dnd-kit/sortable"
import React, { useEffect, useRef, useState } from "react"
import { Button } from "~/core/components/shadcn/button"
import { FieldLabel } from "~/core/components/shadcn/field"
import { Input } from "~/core/components/shadcn/input"
import SortableImage from "~/features/authenticate/manageProduct/components/SortableImage"
import MediaSelectModal from "./MediaSelectModal"
import type { UploadType } from "~/shared/types"

type UploadProps = {
  values?: { url: string; isChecked: boolean }[]
  onChange?: (values: { url: string; checked: boolean }[]) => void
  className?: string
}

export default function Upload({ onChange, values }: UploadProps) {
  const [medias, setMedias] = useState<UploadType[]>([
    { progress: 0, status: "idle", url: "", id: crypto.randomUUID(), file: null, checked: false }
  ])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5
      }
    })
  )

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return

    const newFiles: UploadType[] = Array.from(e.target.files).map((file) => ({
      file,
      progress: 0,
      id: crypto.randomUUID(),
      url: URL.createObjectURL(file),
      status: "idle",
      checked: false
    }))

    // Add new files to state
    setMedias((prev) => [...prev, ...newFiles])

    // Upload ONLY newly added files using setTimeout mock
    const uploadPromises = newFiles.map(async (item) => {
      setMedias((prev) => prev.map((f) => (f.id === item.id ? { ...f, status: "uploading" } : f)))

      await new Promise<void>((resolve) => {
        setTimeout(() => {
          setMedias((prev) => prev.map((f) => (f.id === item.id ? { ...f, progress: 100, status: "success" } : f)))
          resolve()
        }, 1000)
      })
    })

    await Promise.all(uploadPromises)

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleClickUpload = () => {
    setIsMediaModalOpen(true)
  }

  const handleModalSelectMedia = (selectedItems: { url: string; name: string }[]) => {
    const newMediaItems: UploadType[] = selectedItems.map((item) => ({
      id: crypto.randomUUID(),
      url: item.url,
      checked: false,
      progress: 100,
      status: "success",
      file: null
    }))

    setMedias((prev) => {
      const existingUrls = new Set(prev.filter((m) => m.url !== "").map((m) => m.url))
      const uniqueNew = newMediaItems.filter((item) => !existingUrls.has(item.url))
      const validPrevious = prev.filter((m) => m.url !== "")
      return [
        ...validPrevious,
        ...uniqueNew,
        {
          id: crypto.randomUUID(),
          url: "",
          checked: false,
          progress: 0,
          status: "idle",
          file: null
        }
      ]
    })
  }

  const handleCheckedImage = (upload: UploadType, checked: boolean) => {
    setMedias((prev) => prev.map((media) => (media.id === upload.id ? { ...media, checked } : media)))
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over || active.id === over.id) return

    const oldIndex = medias.findIndex((i) => i.id === active.id)
    const newIndex = medias.findIndex((i) => i.id === over.id)
    if (oldIndex !== -1 && newIndex !== -1) {
      setMedias((prev) => arrayMove(prev, oldIndex, newIndex))
    }
  }

  const handleDragCancel = () => {
    setActiveId(null)
  }

  const normalizeMedias = (list: UploadType[]): UploadType[] => {
    const filtered = list.filter((m) => m.file !== null || m.url !== "")
    const emptyFile = list.find((m) => m.file === null && m.url === "") ?? {
      progress: 0,
      status: "idle",
      url: "",
      id: crypto.randomUUID(),
      file: null,
      checked: false
    }

    return [...filtered, emptyFile]
  }

  const handleRemove = () => {
    setMedias((prev) => {
      const remaining = prev.filter((media) => !media.checked)
      const hasEmpty = remaining.some((m) => m.file === null && m.url === "")

      return hasEmpty
        ? remaining
        : [
            ...remaining,
            {
              progress: 0,
              status: "idle",
              url: "",
              id: crypto.randomUUID(),
              file: null,
              checked: false
            }
          ]
    })
  }

  useEffect(() => {
    const filteredMedias = medias
      .filter((media) => media.url !== "")
      .map((media) => ({ url: media.url, checked: Boolean(media.checked) }))
    onChange?.(filteredMedias)
  }, [medias])

  useEffect(() => {
    if (values && values.length > 0) {
      const initialMedias: UploadType[] = values.map((val) => ({
        id: crypto.randomUUID(),
        url: val.url,
        checked: val.isChecked,
        progress: 100,
        status: "success",
        file: null
      }))

      initialMedias.push({
        id: crypto.randomUUID(),
        url: "",
        checked: false,
        progress: 0,
        status: "idle",
        file: null
      })
      setMedias(initialMedias)
    }
  }, [])

  const currentMedias = normalizeMedias(medias)
  const checkedMedias = medias.filter((media) => media.url !== "" && media.checked)
  const activeMedia = medias.find((m) => m.id === activeId)
  const activeIndex = medias.findIndex((m) => m.id === activeId)

  return (
    <>
      <FieldLabel>Media</FieldLabel>
      <Input
        multiple
        type="file"
        className="hidden"
        accept=".png, .jpg, .jpeg, .webp"
        onChange={handleFileChange}
        ref={fileInputRef}
      />

      {checkedMedias.length > 0 && (
        <div className="flex items-center justify-between mb-3 bg-gray-50 px-3 py-2 rounded-md border">
          <div className="text-sm font-medium text-gray-700">{checkedMedias.length} selected</div>
          <Button variant="link" className="text-red-600 hover:text-red-700 p-0 h-auto font-medium" onClick={handleRemove}>
            Delete selected
          </Button>
        </div>
      )}

      <div className="w-full">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext items={currentMedias.map((i) => i.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {currentMedias.map((img, idx) => (
                <SortableImage
                  key={img.id}
                  image={img}
                  isCover={idx === 0 && !!img.url}
                  onClickUpload={handleClickUpload}
                  onCheckedChange={(checked) => handleCheckedImage(img, checked)}
                  isDraggingAny={activeId !== null}
                />
              ))}
            </div>
          </SortableContext>

          <DragOverlay adjustScale={false}>
            {activeMedia && activeMedia.url ? (
              <div className="aspect-square w-32 rounded-lg overflow-hidden border-2 border-blue-500 shadow-2xl bg-white cursor-grabbing relative scale-105 z-50">
                <img src={activeMedia.url} alt="Dragging preview" className="w-full h-full object-cover rounded-lg" />
                {activeIndex === 0 && (
                  <span className="absolute top-2 left-2 bg-black/75 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md backdrop-blur-sm z-10">
                    Cover
                  </span>
                )}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Shopify style Select file Modal */}
      <MediaSelectModal
        open={isMediaModalOpen}
        onOpenChange={setIsMediaModalOpen}
        onSelectMedia={handleModalSelectMedia}
        initialSelectedUrls={medias.filter((m) => m.url !== "").map((m) => m.url)}
      />
    </>
  )
}
