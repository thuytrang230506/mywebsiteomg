'use client'

import { useState } from 'react'
import Link from 'next/link'
import { deleteOrder } from './actions'

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending:   { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Đã xác nhận',  color: 'bg-blue-100 text-blue-700' },
  shipping:  { label: 'Đang giao',    color: 'bg-purple-100 text-purple-700' },
  delivered: { label: 'Đã giao',      color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Đã hủy',       color: 'bg-red-100 text-red-700' },
}

export default function OrderHistory({ orders: initialOrders }: { orders: any[] }) {
  // Thêm State để quản lý danh sách đơn hàng (giúp xóa đơn mà không cần load lại trang)
  const [orders, setOrders] = useState(initialOrders)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Hàm xử lý xóa đơn hàng đã hủy
  async function handleDelete(orderId: string) {
    if (!confirm('Xóa đơn hàng đã hủy này?')) return
    setDeletingId(orderId)
    await deleteOrder(orderId)
    setOrders((prev) => prev.filter((o) => o.id !== orderId))
    setDeletingId(null)
  }

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
          
          // Các biến kiểm tra trạng thái
          const isCancelled = order.status === 'cancelled'
          const isDelivered = order.status === 'delivered'

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
                
                {/* Khu vực trạng thái & Nút xóa */}
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${status.color}`}>
                    {status.label}
                  </span>
                  
                  {isCancelled && (
                    <button
                      onClick={() => handleDelete(order.id)}
                      disabled={deletingId === order.id}
                      className="text-xs text-red-400 hover:text-red-600 border border-red-100 px-2 py-0.5 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
                    >
                      {deletingId === order.id ? '...' : 'Xóa'}
                    </button>
                  )}
                </div>
              </div>

              {/* Danh sách sản phẩm trong đơn */}
              <div className="space-y-1 mb-3">
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

              {/*Nút đánh giá khi đơn đã giao thành công */}
              {isDelivered && (
                <Link
                  href={`/review/${order.id}`}
                  className="inline-flex items-center gap-1.5 text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 px-3 py-1.5 rounded-lg hover:bg-yellow-100 transition font-medium"
                >
                  ⭐ Đánh giá sản phẩm
                </Link>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}