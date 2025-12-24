import { FieldContent, FieldLabel } from '~/components/ui/field'
const mockData = [
  {
    id: '1',
    url: 'https://plus.unsplash.com/premium_photo-1766408195454-7fc26af72ddf?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwyfHx8ZW58MHx8fHx8',
    position: 1
  },
  {
    id: '2',
    url: 'https://images.unsplash.com/photo-1766258725835-88ff59f0040d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwzfHx8ZW58MHx8fHx8',
    position: 2
  },
  {
    id: '3',
    url: 'https://images.unsplash.com/photo-1766425597345-629c0f803d4c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw1fHx8ZW58MHx8fHx8',
    position: 3
  },
  {
    id: '4',
    url: 'https://images.unsplash.com/photo-1766488735864-44c313801587?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw3fHx8ZW58MHx8fHx8',
    position: 4
  },
  {
    id: '5',
    url: 'https://plus.unsplash.com/premium_photo-1766408195454-7fc26af72ddf?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwyfHx8ZW58MHx8fHx8',
    position: 5
  },
  {
    id: '6',
    url: 'https://images.unsplash.com/photo-1766258725835-88ff59f0040d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwzfHx8ZW58MHx8fHx8',
    position: 6
  },
  {
    id: '7',
    url: 'https://images.unsplash.com/photo-1766425597345-629c0f803d4c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw1fHx8ZW58MHx8fHx8',
    position: 7
  },
  {
    id: '8',
    url: 'https://images.unsplash.com/photo-1766488735864-44c313801587?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw3fHx8ZW58MHx8fHx8',
    position: 8
  },
  {
    id: '7',
    url: 'https://images.unsplash.com/photo-1766425597345-629c0f803d4c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw1fHx8ZW58MHx8fHx8',
    position: 7
  },
  {
    id: '8',
    url: 'https://images.unsplash.com/photo-1766488735864-44c313801587?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw3fHx8ZW58MHx8fHx8',
    position: 8
  },
  {
    id: '7',
    url: 'https://images.unsplash.com/photo-1766425597345-629c0f803d4c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw1fHx8ZW58MHx8fHx8',
    position: 7
  },
  {
    id: '8',
    url: 'https://images.unsplash.com/photo-1766488735864-44c313801587?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw3fHx8ZW58MHx8fHx8',
    position: 8
  }
]
export default function CreateProductPage() {
  return (
    <div className='w-full bg-gray-100 h-full'>
      <div className='w-4xl mx-auto p-4'>
        <header>Add Product</header>
        <div className='grid grid-cols-[2fr_1fr] gap-5'>
          <div className='h-screen bg-white rounded-lg p-4'>
            <FieldContent>
              <FieldLabel>Media</FieldLabel>
              {/* Main image */}
              <div className='grid grid-cols-12 gap-4'>
                {/* LEFT: Main image (controls height) */}
                <div className='col-span-12 md:col-span-4'>
                  <div className='aspect-square rounded-xl overflow-hidden border'>
                    <img src={mockData[0].url} className='w-full h-full object-cover' />
                  </div>
                </div>

                {/* RIGHT: 4 cols × 2 rows = 8 images */}
                <div className='col-span-12 md:col-span-8'>
                  <div className='grid grid-cols-4 grid-rows-2 gap-3 h-full'>
                    {mockData.slice(1, 9).map((img, i) => (
                      <div
                        key={i}
                        className='rounded-lg overflow-hidden border cursor-pointer hover:ring-2 hover:ring-black'
                      >
                        <img src={img.url} className='aspect-square' />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className='grid grid-cols-6 gap-4'>
                {mockData.slice(9).map((img, i) => (
                  <div
                    key={i}
                    className='rounded-lg overflow-hidden border cursor-pointer hover:ring-2 hover:ring-black'
                  >
                    <img src={img.url} className='aspect-square' />
                  </div>
                ))}
              </div>
            </FieldContent>
          </div>
          <div className='h-screen bg-white rounded-lg p-4'></div>
        </div>
      </div>
    </div>
  )
}
