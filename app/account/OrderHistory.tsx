const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending:   { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Đã xác nhận',  color: 'bg-blue-100 text-blue-700' },
  shipping:  { label: 'Đang giao',    color: 'bg-purple-100 text-purple-700' },
  delivered: { label: 'Đã giao',      color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Đã hủy',       color: 'bg-red-100 text-red-700' },
}

export default function OrderHistory({ orders }: { orders: any[] }) {
  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm text-center text-gray-400">
        Bạn chưa có đơn hàng nào.
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <h2 className="font-bold text-lg mb-4">Lịch sử đơn hàng</h2>
      <div className="space-y-4">
        {orders.map((order) => {
          const status = STATUS_MAP[order.status] ?? { label: order.status, color: 'bg-gray-100 text-gray-600' }
          return (
            <div key={order.id} className="border border-gray-100 rounded-xl p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-xs text-gray-400">
                    #{order.id.slice(0, 8).toUpperCase()} ·{' '}
                    {new Date(order.created_at).toLocaleDateString('vi-VN')}
                  </p>
                  <p className="font-bold text-red-600 mt-1">
                    {order.total.toLocaleString('vi-VN')}₫
                  </p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${status.color}`}>
                  {status.label}
                </span>
              </div>

              {/* Danh sách sản phẩm trong đơn */}
              <div className="space-y-1">
                {order.order_items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm text-gray-600">
                    <span className="truncate flex-1 mr-2">
                      {item.products?.name ?? 'Sản phẩm'} × {item.quantity}
                    </span>
                    <span className="shrink-0">
                      {(item.unit_price * item.quantity).toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}