'use client'

import { useCartStore } from '@/store/cartStore'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createOrder } from './actions'

// Schema validate với Zod
const checkoutSchema = z.object({
  full_name: z.string().min(2, 'Họ tên tối thiểu 2 ký tự'),
  phone: z.string().regex(/^(0|\+84)[0-9]{9}$/, 'Số điện thoại không hợp lệ'),
  address: z.string().min(10, 'Địa chỉ quá ngắn'),
  note: z.string().optional(),
})

type CheckoutForm = z.infer<typeof checkoutSchema>

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCartStore()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutForm>({ resolver: zodResolver(checkoutSchema) })

  async function onSubmit(data: CheckoutForm) {
    const result = await createOrder({
      ...data,
      items,
      total: totalPrice(),
    })

    if (result.success) {
      clearCart()
      router.push('/?ordered=success')
    } else {
      alert('Đặt hàng thất bại: ' + result.error)
    }
  }

  if (items.length === 0) {
    router.push('/cart')
    return null
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Thanh toán</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col lg:flex-row gap-6">
        {/* Form thông tin giao hàng */}
        <div className="flex-1 space-y-4">
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h2 className="font-bold text-lg mb-4">Thông tin giao hàng</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Họ và tên *
                </label>
                <input
                  {...register('full_name')}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-lavendermist"
                  placeholder="Nguyễn Văn A"
                />
                {errors.full_name && (
                  <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Số điện thoại *
                </label>
                <input
                  {...register('phone')}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-lavendermist"
                  placeholder="0912345678"
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Địa chỉ giao hàng *
                </label>
                <textarea
                  {...register('address')}
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-lavendermist resize-none"
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                />
                {errors.address && (
                  <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Ghi chú (tuỳ chọn)
                </label>
                <input
                  {...register('note')}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-lavendermist"
                  placeholder="Giao giờ hành chính, gọi trước khi giao..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tóm tắt đơn hàng */}
        <div className="lg:w-72 shrink-0">
          <div className="bg-white rounded-xl p-5 shadow-sm sticky top-20">
            <h2 className="font-bold text-lg mb-4">Đơn hàng của bạn</h2>

            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600 truncate flex-1 mr-2">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-medium shrink-0">
                    {((item.sale_price ?? item.price) * item.quantity).toLocaleString('vi-VN')}₫
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t pt-3 mb-4">
              <div className="flex justify-between font-bold text-base">
                <span>Tổng cộng</span>
                <span className="text-red-600">{totalPrice().toLocaleString('vi-VN')}₫</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Miễn phí vận chuyển</p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-mediumslateblue text-white py-3 rounded-xl font-semibold hover:bg-softperiwinkle disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {isSubmitting ? 'Đang đặt hàng...' : 'Xác nhận đặt hàng'}
            </button>
          </div>
        </div>
      </form>
    </main>
  )
}