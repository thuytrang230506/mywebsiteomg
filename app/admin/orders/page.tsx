import { supabaseAdmin } from '@/lib/supabase/admin'
import OrderStatusSelect from './OrderStatusSelect'

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending:   { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Đã xác nhận',  color: 'bg-blue-100 text-blue-700' },
  shipping:  { label: 'Đang giao',    color: 'bg-purple-100 text-purple-700' },
  delivered: { label: 'Đã giao',      color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Đã hủy',       color: 'bg-red-100 text-red-700' },
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams

  let query = supabaseAdmin
    .from('orders')
    .select('*, order_items(quantity, unit_price, products(name))')
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)

  const { data: orders } = await query

  const filterOptions = [
    { value: '', label: 'Tất cả' },
    ...Object.entries(STATUS_MAP).map(([value, { label }]) => ({ value, label })),
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Đơn hàng</h1>

      {/* Filter theo trạng thái - Sửa màu mediumslateblue & bo góc rounded-xl */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {filterOptions.map((opt) => (
          <a
            key={opt.value || 'all'}
            href={opt.value ? `/admin/orders?status=${opt.value}` : '/admin/orders'}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition ${
              status === opt.value || (!status && !opt.value)
                ? 'bg-mediumslateblue text-white border-mediumslateblue'
                : 'border-gray-200 text-gray-600 hover:border-mediumslateblue'
            }`}
          >
            {opt.label}
          </a>
        ))}
      </div>

      {/* Bảng đơn hàng - Sửa bo góc rounded-2xl */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-gray-500">
              <th className="px-5 py-3 font-medium">Mã đơn</th>
              <th className="px-5 py-3 font-medium">Ngày đặt</th>
              <th className="px-5 py-3 font-medium">Sản phẩm</th>
              <th className="px-5 py-3 font-medium">Tổng tiền</th>
              <th className="px-5 py-3 font-medium">Giao đến</th>
              <th className="px-5 py-3 font-medium">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders?.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition">
                <td className="px-5 py-4 font-mono text-xs">
                  #{order.id.slice(0, 8).toUpperCase()}
                </td>
                <td className="px-5 py-4 text-gray-500">
                  {new Date(order.created_at).toLocaleDateString('vi-VN')}
                </td>
                <td className="px-5 py-4 text-gray-600 max-w-[180px]">
                  {order.order_items?.map((item: any) => (
                    <div key={item.products?.name} className="truncate text-xs">
                      {item.products?.name} × {item.quantity}
                    </div>
                  ))}
                </td>
                <td className="px-5 py-4 font-semibold">
                  {order.total.toLocaleString('vi-VN')}₫
                </td>
                <td className="px-5 py-4 text-gray-500 text-xs max-w-[160px] truncate">
                  {order.shipping_address}
                </td>
                <td className="px-5 py-4">
                  <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {orders?.length === 0 && (
          <div className="text-center py-12 text-gray-400">Không có đơn hàng nào.</div>
        )}
      </div>
    </div>
  )
}