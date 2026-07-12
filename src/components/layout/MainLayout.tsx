import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { useAppStore } from '@/stores/appStore'

export function MainLayout() {
  const { sidebarOpen } = useAppStore()

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className={`flex flex-1 flex-col transition-all duration-200 ${sidebarOpen ? 'lg:ml-[260px]' : 'ml-0'}`}>
        <Header />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
