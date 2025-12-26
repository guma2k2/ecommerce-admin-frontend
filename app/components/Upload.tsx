import axios from 'axios'
import { TimerIcon, X } from 'lucide-react'
import React, { useRef, useState } from 'react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
type UploadProps = {
  onChange?: (value?: string) => void
  className?: string
}

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error'
export default function Upload({ onChange }: UploadProps) {
  const [uploadState, setUploadState] = useState<{
    file: File | null
    progress: number
    status: UploadStatus
  }>({
    file: null,
    progress: 0,
    status: 'idle'
  })
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validFileTypes = ['image/jpeg', 'image/png', 'image/webp']
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const file = e.target.files[0]
    setUploadState({ file, status: 'uploading', progress: 0 })

    const formData = new FormData()
    formData.append('file', file)

    try {
      await axios.post('https://httpbin.org/post', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total ? Math.round((progressEvent.loaded * 100) / progressEvent.total) : 0
          setUploadState((prev) => ({ ...prev, progress }))
        }
      })
      const imageUrl = URL.createObjectURL(file)
      setPreview(imageUrl)
      setUploadState((prev) => ({ ...prev, progress: 100, status: 'success' }))
    } catch {
      setUploadState((prev) => ({ ...prev, progress: 0, status: 'error' }))
    }
  }

  const handleClickUpload = () => {
    fileInputRef.current?.click()
  }

  const resetFile = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation()
    setUploadState({ file: null, progress: 0, status: 'idle' })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className='w-full h-full border border-dashed border-gray-500 relative' onClick={handleClickUpload}>
      <Input type='file' className='hidden' accept='.png, .jpg' onChange={handleFileChange} ref={fileInputRef} />
      <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
        {uploadState.status === 'uploading' && <span className=''>Uploading...</span>}
        {uploadState.status === 'error' && <span className='text-red-500'>Error</span>}
      </div>
      {preview && uploadState.status === 'success' && (
        <>
          <img src={preview} className='w-full h-full object-contain' />
          <Button size={'icon-sm'} className='absolute right-0 top-0' variant={'outline'} onClick={resetFile}>
            <X className='text-red-500' />
          </Button>
        </>
      )}
    </div>
  )
}
