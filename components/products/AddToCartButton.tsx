'use client'

import { useState } from 'react'
import { useCartStore } from '@/store/cartStore'

type Product = {
  id: string
  name: string
  slug: string
  price: number
  sale_price: number | null
  image_url: string | null
  stock: number
}

export default function AddToCartButton({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const addItem = useCartStore((state) => state.addItem)

  function handleAdd() {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        sale_price: product.sale_price,
        image_url: product.image_url,
      })
    }
    // Hiện thông báo thêm thành công tạm thời
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (product.stock === 0) {
    return (
      <button disabled className="w-full py-3 rounded-xl bg-gray-200 text-gray-400 font-semibold cursor-not-allowed">
        Hết hàng
      </button>
    )
  }

  return (
    <div className="space-y-3">
      {/* Chọn số lượng */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">Số lượng:</span>
        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 text-lg font-medium"
          >
            −
          </button>
          <span className="w-10 text-center text-sm font-semibold">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
            className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 text-lg font-medium"
          >
            +
          </button>
        </div>
      </div>

      {/* Nút thêm giỏ hàng */}
      <button
        onClick={handleAdd}
        className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 ${
          added
            ? 'bg-green-500 text-white'
            : 'bg-mediumslateblue hover:bg-softperiwinkle text-white'
        }`}
      >
        {added ? '✓ Đã thêm vào giỏ!' : '🛒 Thêm vào giỏ hàng'}
      </button>
    </div>
  )
}