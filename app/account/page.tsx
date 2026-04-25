import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AccountForm from './AccountForm'
import OrderHistory from './OrderHistory'
import LogoutButton from '@/components/layout/LogoutButton'
export const revalidate = 0;
export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch lịch sử đơn hàng + items
  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(*, products(name, image_url))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Tài khoản của tôi</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white p-5 shadow-sm text-center rounded-[2rem]">
            <div className="w-20 h-20 rounded-full bg-periwinkle flex items-center justify-center text-3xl mx-auto mb-3">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} className="w-full h-full rounded-full object-cover" />
              ) : '👤'}
            </div>
            <p className="font-bold text-gray-900">{profile?.full_name || 'Chưa cập nhật'}</p>
            <p className="text-sm text-gray-400">{user.email}</p>
            <div className="mt-4">
              <LogoutButton />
            </div>
          </div>
        </div>

        {/* Nội dung chính */}
        <div className="md:col-span-2 space-y-6">
          <AccountForm profile={profile} userId={user.id} />
          <OrderHistory orders={orders ?? []} />
        </div>
      </div>
    </main>
  )
}