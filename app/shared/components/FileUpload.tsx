import { useState, useRef, useEffect, type DragEvent, type ChangeEvent } from "react"
import {
  UploadCloud,
  FolderOpen,
  X,
  Loader2,
  Image as ImageIcon,
  RotateCw,
  ImagePlus
} from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "~/core/components/shadcn/button"
import { Spinner } from "~/core/components/shadcn/spinner"
import MediaSelectModal from "./MediaSelectModal"
import { uploadMedia } from "~/shared/services/api/mediaService"
import { showToast } from "~/shared/utils/toast"
import { cn } from "~/shared/utils/appUtils"

export type FileUploadVariant = "dropzone" | "compact" | "avatar"

export interface FileUploadProps {
  value?: string
  defaultValue?: string
  onChange?: (url: string, mediaId?: string) => void
  onRemove?: () => void
  disabled?: boolean
  isMultiple?: boolean
  acceptFile?: string
  validFileTypes?: string[]
  maxSize?: number // in bytes, defaults to 5MB (5 * 1024 * 1024)
  variant?: FileUploadVariant
  className?: string
  previewClassName?: string
  placeholderText?: string
  hintText?: string
  mediaDialog?: boolean // default false
  showMediaModal?: boolean // alias for mediaDialog
  showMediaDialog?: boolean // alias for mediaDialog
}

const DEFAULT_MAX_SIZE = 5 * 1024 * 1024 // 5MB
const DEFAULT_ACCEPT = "image/png,image/jpeg,image/webp,image/svg+xml,image/gif,.png,.jpg,.jpeg,.webp,.svg,.gif"

export default function FileUpload({
  value,
  defaultValue = "",
  onChange,
  onRemove,
  disabled = false,
  isMultiple = false,
  acceptFile = DEFAULT_ACCEPT,
  validFileTypes = [],
  maxSize = DEFAULT_MAX_SIZE,
  variant = "dropzone",
  className,
  previewClassName,
  placeholderText,
  hintText,
  mediaDialog = false,
  showMediaModal,
  showMediaDialog
}: FileUploadProps) {
  const { t } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isMediaDialogEnabled = Boolean(mediaDialog || showMediaDialog || showMediaModal)

  const [internalUrl, setInternalUrl] = useState<string>(value ?? defaultValue)
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [isMediaModalOpen, setIsMediaModalOpen] = useState<boolean>(false)
  const [imagePreviewFailed, setImagePreviewFailed] = useState<boolean>(false)

  // Sync internal state when controlled value prop updates
  useEffect(() => {
    if (value !== undefined) {
      setInternalUrl(value)
      setImagePreviewFailed(false)
    }
  }, [value])

  const handleOpenFilePicker = () => {
    if (disabled || isUploading) return
    fileInputRef.current?.click()
  }

  const validateFile = (file: File): boolean => {
    // Validate File Type
    if (validFileTypes.length > 0) {
      if (!validFileTypes.includes(file.type)) {
        showToast("error", "upload.invalidFileType")
        return false
      }
    } else if (!file.type.startsWith("image/")) {
      showToast("error", "upload.invalidFileType")
      return false
    }

    // Validate File Size
    if (file.size > maxSize) {
      showToast("error", "upload.fileTooLarge")
      return false
    }

    return true
  }

  const handleUploadSingleFile = async (file: File) => {
    if (!validateFile(file)) return

    try {
      setIsUploading(true)
      setImagePreviewFailed(false)
      const newItem = await uploadMedia(file)
      
      setInternalUrl(newItem.url)
      onChange?.(newItem.url, newItem.id)
      showToast("success", "toasts.uploadSuccess")
    } catch (err) {
      console.error("FileUpload error:", err)
      showToast("error", "toasts.uploadFailed")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }


  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return
    const file = e.target.files[0]
    handleUploadSingleFile(file)
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    if (!disabled && !isUploading) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (disabled || isUploading) return

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUploadSingleFile(e.dataTransfer.files[0])
    }
  }

  const handleModalSelectMedia = (selectedMedias: { id: string; url: string; name: string }[]) => {
    if (selectedMedias.length > 0) {
      const selectedItem = selectedMedias[0]
      setInternalUrl(selectedItem.url)
      setImagePreviewFailed(false)
      onChange?.(selectedItem.url, selectedItem.id)
    }
  }

  const handleClickTrigger = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (disabled || isUploading) return
    if (isMediaDialogEnabled) {
      setIsMediaModalOpen(true)
    } else {
      handleOpenFilePicker()
    }
  }

  const handleRemove = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setInternalUrl("")
    setImagePreviewFailed(false)
    onChange?.("", undefined)
    onRemove?.()
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // --- Variant 1: Compact Thumbnail Mode ---
  if (variant === "compact") {
    return (
      <>
        <div
          className={cn(
            "group relative aspect-square w-full rounded-md border border-dashed transition-all overflow-hidden bg-white dark:bg-zinc-900 select-none",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-gray-300 dark:border-zinc-700 hover:border-primary",
            disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
            className
          )}
          onClick={handleClickTrigger}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple={isMultiple}
            accept={acceptFile}
            className="hidden"
            onChange={handleFileInputChange}
            disabled={disabled || isUploading}
          />

          {isUploading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-zinc-900/80">
              <Spinner />
            </div>
          ) : internalUrl && !imagePreviewFailed ? (
            <div className="relative w-full h-full">
              <img
                src={internalUrl}
                alt="Uploaded file"
                onError={() => setImagePreviewFailed(true)}
                className="w-full h-full object-cover rounded-md"
              />
              {!disabled && (
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                  <button
                    type="button"
                    onClick={handleClickTrigger}
                    className="p-1 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors"
                    title={t("upload.changeImage", "Change Image")}
                  >
                    <RotateCw className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleRemove}
                    className="p-1 rounded-full bg-red-600/80 hover:bg-red-600 text-white transition-colors"
                    title={t("upload.removeImage", "Remove Image")}
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-1 p-1">
              <ImagePlus className="size-5 text-blue-500" />
            </div>
          )}
        </div>

        {isMediaDialogEnabled && (
          <MediaSelectModal
            open={isMediaModalOpen}
            onOpenChange={setIsMediaModalOpen}
            onSelectMedia={handleModalSelectMedia}
            initialSelectedUrls={internalUrl ? [internalUrl] : []}
            multiple={isMultiple}
          />
        )}
      </>
    )
  }

  // --- Variant 2: Avatar Mode ---
  if (variant === "avatar") {
    return (
      <>
        <div
          className={cn(
            "group relative aspect-square w-24 h-24 rounded-full border-2 border-dashed transition-all overflow-hidden bg-gray-50 dark:bg-zinc-900 select-none",
            isDragging
              ? "border-primary bg-primary/5 scale-95"
              : "border-gray-300 dark:border-zinc-700 hover:border-primary",
            disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
            className
          )}
          onClick={handleClickTrigger}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple={isMultiple}
            accept={acceptFile}
            className="hidden"
            onChange={handleFileInputChange}
            disabled={disabled || isUploading}
          />

          {isUploading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-zinc-900/80">
              <Loader2 className="size-6 animate-spin text-primary" />
            </div>
          ) : internalUrl && !imagePreviewFailed ? (
            <div className="relative w-full h-full">
              <img
                src={internalUrl}
                alt="Avatar"
                onError={() => setImagePreviewFailed(true)}
                className="w-full h-full object-cover"
              />
              {!disabled && (
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={handleClickTrigger}
                    className="p-1.5 rounded-full bg-white/20 hover:bg-white/40 text-white"
                    title={t("upload.changeImage", "Change Image")}
                  >
                    <RotateCw className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleRemove}
                    className="p-1.5 rounded-full bg-red-600/80 hover:bg-red-600 text-white"
                    title={t("upload.removeImage", "Remove Image")}
                  >
                    <X className="size-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
              <UploadCloud className="size-6 text-primary" />
            </div>
          )}
        </div>

        {isMediaDialogEnabled && (
          <MediaSelectModal
            open={isMediaModalOpen}
            onOpenChange={setIsMediaModalOpen}
            onSelectMedia={handleModalSelectMedia}
            initialSelectedUrls={internalUrl ? [internalUrl] : []}
            multiple={isMultiple}
          />
        )}
      </>
    )
  }

  // --- Variant 3: Default Dropzone Mode (Full Featured Form Upload) ---
  return (
    <div className={cn("w-full space-y-2 select-none", className)}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={isMultiple}
        accept={acceptFile}
        className="hidden"
        onChange={handleFileInputChange}
        disabled={disabled || isUploading}
      />

      {/* Uploading State */}
      {isUploading ? (
        <div className="w-full h-44 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 flex flex-col items-center justify-center p-4 gap-2.5 transition-all">
          <Loader2 className="size-8 animate-spin text-primary" />
          <span className="text-xs font-medium text-primary">
            {t("upload.uploadingImage", "Uploading image...")}
          </span>
        </div>
      ) : internalUrl && !imagePreviewFailed ? (
        /* Image Preview Card */
        <div
          className={cn(
            "w-full rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50 p-4 space-y-3",
            previewClassName
          )}
        >
          <div className="relative w-full h-44 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 flex items-center justify-center p-3 overflow-hidden group">
            <img
              src={internalUrl}
              alt="Uploaded file preview"
              onError={() => setImagePreviewFailed(true)}
              className="max-h-36 max-w-full object-contain transition-transform duration-200 group-hover:scale-105"
            />

            {!disabled && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/60 hover:bg-red-600 text-white transition-colors duration-150 shadow-sm cursor-pointer"
                title={t("upload.removeImage", "Remove Image")}
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Action Toolbar Below Image */}
          {!disabled && (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleOpenFilePicker}
                  className="h-8 text-xs gap-1.5"
                >
                  <RotateCw className="size-3.5" />
                  {t("upload.changeImage", "Change Image")}
                </Button>

                {isMediaDialogEnabled && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsMediaModalOpen(true)}
                    className="h-8 text-xs gap-1.5"
                  >
                    <FolderOpen className="size-3.5" />
                    {t("upload.selectFromMedia", "Select from Media Library")}
                  </Button>
                )}
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 gap-1.5"
              >
                <X className="size-3.5" />
                {t("upload.removeImage", "Remove")}
              </Button>
            </div>
          )}
        </div>
      ) : (
        /* Empty Upload / Dropzone Box */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleOpenFilePicker}
          className={cn(
            "group relative w-full h-44 rounded-xl border-2 border-dashed p-6 text-center transition-all duration-200 flex flex-col items-center justify-center space-y-3",
            disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
            isDragging
              ? "border-primary bg-primary/5 dark:bg-primary/10 scale-[0.99]"
              : "border-gray-300 dark:border-zinc-700 hover:border-primary hover:bg-gray-50/50 dark:hover:bg-zinc-800/50 bg-gray-50/30 dark:bg-zinc-900/30"
          )}
        >
          <div className="p-3 bg-primary/10 text-primary rounded-full group-hover:scale-110 transition-transform duration-200">
            <UploadCloud className="size-6" />
          </div>
          <div className="space-y-1 max-w-sm">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {placeholderText || t("upload.uploadPrompt", "Click to upload or drag and drop")}
            </p>
            <p className="text-xs text-muted-foreground">
              {hintText || t("upload.uploadHint", "SVG, PNG, JPG, or WEBP (Max 5MB)")}
            </p>
          </div>

          {isMediaDialogEnabled && !disabled && (
            <div className="flex items-center gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsMediaModalOpen(true)}
                className="h-7 text-xs bg-white dark:bg-zinc-800 shadow-2xs gap-1.5 border-gray-300 dark:border-zinc-600"
              >
                <FolderOpen className="size-3.5 text-primary" />
                {t("upload.selectFromMedia", "Select from Media Library")}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Fallback if image URL failed to load */}
      {internalUrl && imagePreviewFailed && (
        <div className="flex items-center justify-between p-3 rounded-lg border border-red-200 bg-red-50/60 dark:border-red-900/50 dark:bg-red-950/30 text-xs text-red-600 dark:text-red-400">
          <div className="flex items-center gap-2">
            <ImageIcon className="size-4 shrink-0" />
            <span>{t("upload.failedToLoadPreview", "Failed to load image preview")}</span>
          </div>
          {!disabled && (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleOpenFilePicker}
                className="h-6 px-2 text-xs"
              >
                {t("upload.changeImage", "Change")}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="h-6 px-2 text-xs text-red-600"
              >
                {t("upload.removeImage", "Remove")}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Media Select Modal */}
      {isMediaDialogEnabled && (
        <MediaSelectModal
          open={isMediaModalOpen}
          onOpenChange={setIsMediaModalOpen}
          onSelectMedia={handleModalSelectMedia}
          initialSelectedUrls={internalUrl ? [internalUrl] : []}
          multiple={isMultiple}
        />
      )}
    </div>
  )
}
