import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const navItems = [
  { href: '/admin',          label: '📊 Dashboard' },
  { href: '/admin/products', label: '📦 Sản phẩm' },
  { href: '/admin/orders',   label: '🧾 Đơn hàng' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Kiểm tra quyền truy cập (Có thể thêm check role admin ở đây nếu cần)
  if (!user) redirect('/login')

  return (
    <div className="flex min-h-screen bg-[#F8F9FD]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 shrink-0 sticky top-0 h-screen flex flex-col">
        {/* Logo Section */}
        <div className="p-6">
          <Link href="/admin" className="block group">
            <div className="flex items-center gap-2 mt-2">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Admin Panel</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center px-4 py-3 rounded-2xl text-sm font-bold text-gray-500 hover:bg-mediumslateblue/[0.08] hover:text-mediumslateblue transition-all duration-200"
            >
              <span className="group-hover:scale-110 transition-transform duration-200">
                {item.label}
              </span>
            </Link>
          ))}
        </nav>

        {/* User Info (Bottom Sidebar) */}
        <div className="p-4 border-t border-gray-50">
          <div className="bg-gray-50 rounded-2xl p-3 flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-mediumslateblue text-white flex items-center justify-center font-bold text-xs">
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-gray-700 truncate">{user.email}</p>
              <p className="text-[10px] text-gray-400 font-medium">Quản trị viên</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-10 overflow-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}