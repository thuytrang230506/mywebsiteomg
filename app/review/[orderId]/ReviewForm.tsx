'use client'

import { useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Product = {
  id: string
  name: string
  slug: string
  image_url: string | null
}

// THÊM: orderId vào Props
export default function ReviewForm({ product, userId, orderId }: { product: Product; userId: string; orderId: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) { setError('Vui lòng chọn số sao'); return }
    setSubmitting(true)
    setError('')

    //Gửi thêm order_id vào database
    const { error: err } = await supabase.from('reviews').insert({
      product_id: product.id,
      user_id: userId,
      order_id: orderId, 
      rating,
      comment: comment.trim(),
    })

    if (err) {
      setError(err.message)
    } else {
      setDone(true)
      router.refresh()
    }
    setSubmitting(false)
  }

  if (done) {
    return (
      <div className="bg-[#F0FFF0] border border-green-100 rounded-[2rem] p-6 flex items-center gap-5 transition-all animate-in fade-in zoom-in">
        <div className="text-4xl bg-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm">✅</div>
        <div>
          <p className="font-black text-green-900 text-lg tracking-tight">Đã gửi đánh giá thành công!</p>
          <p className="text-sm font-bold text-green-700/70 uppercase tracking-wider">{product.name}</p>
        </div>
      </div>
    )
  }

  return (
    <form 
      onSubmit={handleSubmit} 
      className="bg-white rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50"
    >
      <div className="flex items-center gap-5 mb-8">
        <div className="relative w-20 h-20 rounded-[1.5rem] overflow-hidden bg-gray-50 shrink-0 border border-gray-100">
          {product.image_url ? (
            <Image src={product.image_url} alt={product.name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">📦</div>
          )}
        </div>
        <div className="min-w-0">
          <h3 className="font-black text-xl text-gray-900 tracking-tight leading-tight truncate">{product.name}</h3>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">Sản phẩm đã nhận</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 bg-red-50 rounded-xl text-red-500 text-xs font-bold border border-red-100">
          ⚠️ {error}
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-black text-gray-800 uppercase tracking-wider">Đánh giá của bạn</p>
          <p className="text-[11px] text-gray-400 font-medium">Vui lòng chọn từ 1 đến 5 sao</p>
        </div>
        <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-2xl">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                className="text-2xl transition-all hover:scale-110 active:scale-90"
              >
                <span className={(hovered || rating) >= star ? 'text-yellow-400 drop-shadow-sm' : 'text-gray-200'}>
                  ★
                </span>
              </button>
            ))}
          </div>
          {rating > 0 && (
            <span className="text-[10px] font-black text-mediumslateblue uppercase tracking-widest border-l border-gray-200 pl-3 ml-1">
              {['', 'Tệ', 'Ổn', 'Thường', 'Tốt', 'Tuyệt'][rating]}
            </span>
          )}
        </div>
      </div>

      <div className="mb-8">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder="Bạn cảm thấy sản phẩm này thế nào? Chia sẻ cho shop nhé..."
          className="w-full bg-gray-50/50 border-2 border-gray-50 rounded-[1.5rem] px-6 py-4 text-sm font-medium text-gray-700 placeholder:text-gray-300 focus:outline-none focus:border-mediumslateblue/20 focus:bg-white transition-all resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-mediumslateblue text-white font-black py-4 rounded-[3.5rem] text-sm transition-all shadow-lg shadow-mediumslateblue/20 hover:bg-softperiwinkle active:scale-[0.98] disabled:opacity-50 uppercase tracking-[0.15em]"
      >
        {submitting ? 'Đang xử lý...' : 'Gửi đánh giá ⭐'}
      </button>
    </form>
  )
}