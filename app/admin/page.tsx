import { supabaseAdmin } from '@/lib/supabase/admin'
import Link from 'next/link'

export default async function AdminDashboard() {
  // Fetch thống kê song song
  const [
    { count: totalProducts },
    { count: totalOrders },
    { data: recentOrders },
    { data: revenue },
  ] = await Promise.all([
    supabaseAdmin.from('products').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('orders')
      .select('id, total, status, created_at')
      .order('created_at', { ascending: false })
      .limit(8),
    supabaseAdmin.from('orders')
      .select('total')
      .eq('status', 'delivered'),
  ])

  const totalRevenue = revenue?.reduce((sum, o) => sum + o.total, 0) ?? 0

  // Cấu hình lại màu sắc cho các card thống kê theo tông màu shop
  const stats = [
    { label: 'Sản phẩm tại shop', value: totalProducts ?? 0, icon: '📦', color: 'bg-white text-mediumslateblue border-mediumslateblue/20', href: '/admin/products' },
    { label: 'Đơn hàng đã nhận', value: totalOrders ?? 0, icon: '🧾', color: 'bg-white text-mediumslateblue border-mediumslateblue/20', href: '/admin/orders' },
    { label: 'Doanh thu cửa hàng', value: totalRevenue.toLocaleString('vi-VN') + '₫', icon: '💰', color: 'bg-[#77DD66] text-white border-transparent', href: '#' },
  ]

  const STATUS_MAP: Record<string, { label: string; color: string }> = {
    pending: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700' },
    confirmed: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700' },
    shipping: { label: 'Đang giao', color: 'bg-indigo-100 text-indigo-700' },
    delivered: { label: 'Đã giao', color: 'bg-green-100 text-green-700' },
    cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-700' },
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex justify-between items-end">
        <div>
          <p className="text-mediumslateblue font-bold text-sm uppercase tracking-wider mb-1">Quản trị viên</p>
          <h1 className="text-3xl font-black text-gray-800">Dưa chuột không cá 🥒</h1>
        </div>
        <Link 
          href="/admin/products/new" 
          className="bg-mediumslateblue text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-softperiwinkle transition-all shadow-lg shadow-mediumslateblue/20 active:scale-95"
        >
          + Thêm sản phẩm mới
        </Link>
      </div>

      {/* Thống kê dạng Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((s) => (
          <Link 
            key={s.label} 
            href={s.href} 
            className={`block rounded-3xl p-7 border-2 transition-all hover:shadow-xl hover:-translate-y-1 ${s.color}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-3xl font-black mb-1">{s.value}</p>
                <p className="text-sm font-bold opacity-80 uppercase tracking-tight">{s.label}</p>
              </div>
              <span className="text-2xl opacity-80">{s.icon}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Đơn hàng gần đây */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex justify-between items-center p-7 border-b border-gray-50">
          <h2 className="font-black text-xl text-gray-800">Đơn hàng mới nhất</h2>
          <Link href="/admin/orders" className="text-sm font-bold text-mediumslateblue hover:text-softperiwinkle transition">
            Xem tất cả →
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 uppercase text-[10px] tracking-[0.15em] font-black">
                <th className="px-8 py-5">Mã định danh</th>
                <th className="px-8 py-5">Ngày đặt hàng</th>
                <th className="px-8 py-5 text-right">Thành tiền</th>
                <th className="px-8 py-5 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentOrders?.map((order) => {
                const status = STATUS_MAP[order.status]
                return (
                  <tr key={order.id} className="hover:bg-mediumslateblue/[0.02] transition-colors group">
                    <td className="px-8 py-5 font-mono text-xs font-bold text-gray-600 group-hover:text-mediumslateblue">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-8 py-5 text-gray-500 font-medium">
                      {new Date(order.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-8 py-5 font-black text-right text-gray-900 text-base">
                      {order.total.toLocaleString('vi-VN')}₫
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`inline-block px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${status?.color}`}>
                        {status?.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}