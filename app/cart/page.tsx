'use client'

import { useCartStore } from '@/store/cartStore'
import Image from 'next/image'
import Link from 'next/link'

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice } = useCartStore()

  if (items.length === 0) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h1 className="text-xl font-bold text-gray-700 mb-2">Giỏ hàng trống</h1>
        <p className="text-gray-400 mb-6">Thêm sản phẩm vào giỏ để tiến hành mua hàng</p>
        <Link href="/products" className="bg-mediumslateblue text-white px-6 py-3 rounded-xl font-semibold hover:bg-softperiwinkle transition">
          Tiếp tục mua sắm
        </Link>
      </main>
    )
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Giỏ hàng ({items.length} sản phẩm)</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Danh sách sản phẩm */}
        <div className="flex-1 space-y-3">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl p-4 flex gap-4 shadow-sm">
              {/* Ảnh */}
              <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                {item.image_url ? (
                  <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">📦</div>
                )}
              </div>

              {/* Thông tin */}
              <div className="flex-1 min-w-0">
                <Link href={`/products/${item.slug}`} className="font-medium text-gray-800 hover:text-mediumslateblue line-clamp-1">
                  {item.name}
                </Link>
                <p className="text-mediumslateblue font-bold mt-1">
                  {(item.sale_price ?? item.price).toLocaleString('vi-VN')}₫
                </p>

                {/* Điều chỉnh số lượng */}
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-100"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-xs text-gray-400 hover:text-powerblush transition"
                  >
                    Xóa
                  </button>
                </div>
              </div>

              {/* Thành tiền */}
              <div className="text-right shrink-0">
                <p className="font-bold text-gray-800">
                  {((item.sale_price ?? item.price) * item.quantity).toLocaleString('vi-VN')}₫
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Tổng tiền */}
        <div className="lg:w-72 shrink-0">
          <div className="bg-white rounded-xl p-5 shadow-sm sticky top-20">
            <h2 className="font-bold text-lg mb-4">Tóm tắt đơn hàng</h2>
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex justify-between">
                <span>Tạm tính</span>
                <span>{totalPrice().toLocaleString('vi-VN')}₫</span>
              </div>
              <div className="flex justify-between">
                <span>Phí vận chuyển</span>
                <span className="text-green-600">Miễn phí</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-gray-800 text-base">
                <span>Tổng cộng</span>
                <span className="text-red-600">{totalPrice().toLocaleString('vi-VN')}₫</span>
              </div>
            </div>
            <Link
              href="/checkout"
              className="block w-full bg-mediumslateblue text-white text-center py-3 rounded-xl font-semibold hover:bg-softperiwinkle transition"
            >
              Tiến hành thanh toán →
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}