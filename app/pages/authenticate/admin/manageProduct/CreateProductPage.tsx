import { useState } from 'react'
import ProductInformationForm from '~/features/authenticate/manageProduct/components/ProductInformationForm'

export default function CreateProductPage() {
  const [images, setImages] = useState<{ id: string; url: string; position?: number }[]>([
    {
      id: 'img-1',
      url: 'https://plus.unsplash.com/premium_photo-1766408195454-7fc26af72ddf?w=600&auto=format&fit=crop&q=60',
      position: 1
    },
    {
      id: 'img-2',
      url: 'https://images.unsplash.com/photo-1766258725835-88ff59f0040d?w=600&auto=format&fit=crop&q=60',
      position: 2
    },
    {
      id: 'img-3',
      url: 'https://images.unsplash.com/photo-1766425597345-629c0f803d4c?w=600&auto=format&fit=crop&q=60',
      position: 3
    },
    {
      id: 'img-4',
      url: 'https://images.unsplash.com/photo-1766488735864-44c313801587?w=600&auto=format&fit=crop&q=60',
      position: 4
    },
    {
      id: 'img-5',
      url: 'https://plus.unsplash.com/premium_photo-1766408195454-7fc26af72ddf?w=600&auto=format&fit=crop&q=60',
      position: 5
    },
    {
      id: 'img-6',
      url: 'https://images.unsplash.com/photo-1766258725835-88ff59f0040d?w=600&auto=format&fit=crop&q=60',
      position: 6
    },
    {
      id: 'img-7',
      url: 'https://images.unsplash.com/photo-1766425597345-629c0f803d4c?w=600&auto=format&fit=crop&q=60',
      position: 7
    },
    {
      id: 'img-8',
      url: 'https://images.unsplash.com/photo-1766488735864-44c313801587?w=600&auto=format&fit=crop&q=60',
      position: 8
    },
    {
      id: 'img-9',
      url: 'https://images.unsplash.com/photo-1766425597345-629c0f803d4c?w=600&auto=format&fit=crop&q=60',
      position: 9
    },
    {
      id: 'img-10',
      url: 'https://images.unsplash.com/photo-1766488735864-44c313801587?w=600&auto=format&fit=crop&q=60',
      position: 10
    },
    {
      id: 'img-11',
      url: 'https://images.unsplash.com/photo-1766425597345-629c0f803d4c?w=600&auto=format&fit=crop&q=60',
      position: 11
    },
    {
      id: 'img-12',
      url: 'https://images.unsplash.com/photo-1766488735864-44c313801587?w=600&auto=format&fit=crop&q=60',
      position: 12
    }
  ])
  return (
    <div className='w-full bg-gray-100 h-full'>
      <div className='w-5xl mx-auto p-4'>
        <header>Add Product</header>
        <div className='grid grid-cols-[2fr_1fr] gap-5'>
          <div className='h-screen bg-white rounded-lg p-4'>
            <ProductInformationForm />
          </div>
          <div className='h-screen bg-white rounded-lg p-4'></div>
        </div>
      </div>
    </div>
  )
}
