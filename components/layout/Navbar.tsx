import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import CartBadge from './CartBadge'
import { Roboto } from 'next/font/google'

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
    <header className={`${roboto.className} bg-white shadow-sm sticky top-0 z-50`}>
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-mediumslateblue">
          Dưa chuột không cá🥒
        </Link>

        {/* Search bar */}
        <form action="/search" className="hidden md:flex flex-1 max-w-md">
          <input
            name="q"
            placeholder="Tìm kiếm sản phẩm..."
            className="w-full border border-gray-200 rounded-l-lg px-4 py-2 text-sm focus:outline-none focus:border-mediumslateblue"
          />
          <button type="submit" className="bg-mediumslateblue text-white px-4 py-2 rounded-r-lg">
            🔍
          </button>
        </form>

        {/* Nav links */}
        <nav className="flex items-center gap-4">
          <Link href="/products" className="text-sm text-gray-600 hover:text-softperiwinkle hidden md:block">
            Sản phẩm
          </Link>

          <CartBadge />

          {user ? (
            <div className="flex items-center gap-4">
              {/* Tài khoản đứng trước */}
              <Link href="/account" className="text-sm text-gray-600 hover:text-softperiwinkle">
                👤 Tài khoản
              </Link>

              {/* Nút Admin — hiện ở ngoài cùng bên phải */}
              {isAdmin && (
                <Link
                  href="/admin"
                  className="text-sm bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 transition font-medium"
                >
                  ⚙️ Admin
                </Link>
              )}
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