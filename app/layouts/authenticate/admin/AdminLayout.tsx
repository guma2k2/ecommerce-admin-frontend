import { Outlet } from 'react-router'
export default function AdminLayout() {
  return (
    <div className='h-full'>
      <Outlet />
    </div>
  )
}
