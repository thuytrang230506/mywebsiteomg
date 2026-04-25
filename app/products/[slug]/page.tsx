import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import type { Metadata } from 'next'
import AddToCartButton from '@/components/products/AddToCartButton'

// 1. Tạo metadata động
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  
  const { data: product } = await supabase
    .from('products')
    .select('name, description, image_url')
    .eq('slug', slug)
    .single()

  if (!product) return { title: 'Sản phẩm không tồn tại' }

  return {
    title: `${product.name} | Dưa chuột không cá`,
    description: product.description ?? '',
    openGraph: {
      title: product.name,
      images: product.image_url ? [product.image_url] : [],
    },
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  console.log("🔍 Đang tìm sản phẩm với slug:", slug)

  const { data: product, error } = await supabase
    .from('products')
    .select(`
      *,
      categories(name, slug),
      product_images(*),
      reviews(*)
    `)
    .eq('slug', slug)
    .single()

  if (error || !product) {
    console.error("❌ Lỗi truy vấn hoặc không thấy SP:", error)
    notFound()
  }

  const allImages = [
    ...(product.image_url ? [product.image_url] : []),
    ...(product.product_images?.map((img: any) => img.image_url) ?? []),
  ]

  const avgRating = product.reviews?.length
    ? (product.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / product.reviews.length).toFixed(1)
    : null

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-10">
        {/* Phần hiển thị Ảnh */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
            {allImages[0] ? (
              <Image 
                src={allImages[0]} 
                alt={product.name} 
                fill 
                priority
                className="object-cover hover:scale-105 transition-transform duration-500" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                Không có ảnh
              </div>
            )}
          </div>
          
          {allImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {allImages.map((url: string, i: number) => (
                <div key={i} className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 border-gray-100 hover:border-blue-500 transition-all cursor-pointer">
                  <Image src={url} alt={`Thumbnail ${i}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Phần Thông tin sản phẩm */}
        <div className="flex flex-col">
          <nav className="text-sm text-mediumslateblue font-medium mb-2 uppercase tracking-wide">
            {product.categories?.name || 'Chưa phân loại'}
          </nav>
          
          <h1 className="text-3xl font-extrabold text-gray-900 mb-4">{product.name}</h1>

          <div className="flex items-center gap-4 mb-6">
            {avgRating && (
              <span className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded-md text-sm font-bold">
                ⭐ {avgRating} <span className="text-gray-400 font-normal">({product.reviews.length} đánh giá)</span>
              </span>
            )}
            <span className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'} font-medium`}>
              {product.stock > 0 ? `Còn hàng (${product.stock})` : 'Hết hàng'}
            </span>
          </div>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-4xl font-black text-mediumslateblue">
              {(product.sale_price ?? product.price).toLocaleString('vi-VN')}₫
            </span>
            {product.sale_price && (
              <span className="text-gray-400 line-through text-xl">
                {product.price.toLocaleString('vi-VN')}₫
              </span>
            )}
          </div>

          <div className="bg-lavendermist rounded-2xl p-6 mb-8">
            <h3 className="text-sm font-bold text-gray-900 mb-2 uppercase">Mô tả sản phẩm</h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
              {product.description || "Đang cập nhật mô tả..."}
            </p>
          </div>

          <AddToCartButton product={product} />
        </div>
      </div>

      {/* Phần Đánh giá khách hàng */}
      <section className="mt-16 border-t border-gray-100 pt-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
          Đánh giá từ khách hàng 
          <span className="text-sm font-normal text-gray-500">({product.reviews?.length || 0})</span>
        </h2>
        
        {product.reviews?.length > 0 ? (
          <div className="grid gap-6">
            {product.reviews.map((review: any) => (
              <div key={review.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    {/* FIX 2: Bỏ review.users?.full_name vì không join users nữa */}
                    <div className="font-bold text-gray-900">Khách hàng</div>
                    <div className="text-xs text-gray-400">Đã mua hàng</div>
                  </div>
                  <div className="flex text-yellow-400">
                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                  </div>
                </div>
                <p className="text-gray-600 italic">"{review.comment}"</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-2xl text-gray-400 italic">
            Chưa có đánh giá nào cho sản phẩm này.
          </div>
        )}
      </section>
    </main>
  )
}