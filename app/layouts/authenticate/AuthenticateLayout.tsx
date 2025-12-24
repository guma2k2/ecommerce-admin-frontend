import { Outlet } from 'react-router'
import { AppSidebar } from '~/components/Sidebar'
import { SidebarProvider, SidebarTrigger } from '~/components/ui/sidebar'

export default function AuthenticateLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className='w-full'>
        {/* <SidebarTrigger /> */}
        <Outlet />
      </main>
    </SidebarProvider>
  )
}
