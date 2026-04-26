import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import CartBadge from './CartBadge'
import LogoutButton from './LogoutButton'
import NotificationBell from './NotificationBell'
import { Roboto } from 'next/font/google'

// Khởi tạo Font Roboto từ Code update
const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto',
})

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Kiểm tra role admin
  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    isAdmin = profile?.role === 'admin'
  }

  return (
    // Áp dụng roboto.className và các style sticky/shadow từ bản update
    <header className={`${roboto.className} bg-white shadow-sm sticky top-0 z-50`}>
      <div className="max-w-xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        
        {/* Logo mới từ bản update */}
        <Link href="/" className="text-xl font-bold text-mediumslateblue">
          Dưa chuột không cá🥒
        </Link>

        {/* Search bar cập nhật màu focus và bo góc */}
        <form action="/search" className="hidden md:flex flex-1 max-w-2xl">
          <input
            name="q"
            placeholder="Tìm kiếm sản phẩm..."
            className="w-full border border-gray-200 rounded-l-lg px-4 py-2 text-sm focus:outline-none focus:border-mediumslateblue"
          />
          <button type="submit" className="bg-mediumslateblue text-white px-4 py-2 rounded-r-lg">
            🔍
          </button>
        </form>

        <nav className="flex items-center gap-4">
          <Link href="/products" className="text-sm text-gray-600 hover:text-softperiwinkle hidden md:block">
            Sản phẩm
          </Link>

          <CartBadge />

          {user ? (
            <div className="flex items-center gap-4">
              {/* Giữ lại Chuông thông báo của bạn */}
              <NotificationBell />

              {/* Sắp xếp: Tài khoản -> Admin -> Logout (theo logic code update) */}
              <Link href="/account" className="text-sm text-gray-600 hover:text-softperiwinkle">
                👤 Tài khoản
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  className="text-sm bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 transition font-medium"
                >
                  ⚙️ Admin
                </Link>
              )}

              {/* Giữ nút Logout của bạn */}
              <LogoutButton />
            </div>
          ) : (
            <Link 
              href="/login" 
              className="bg-mediumslateblue text-white text-sm px-4 py-2 rounded-lg hover:bg-softperiwinkle transition"
            >
              Đăng nhập
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}