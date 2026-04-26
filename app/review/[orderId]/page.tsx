import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import ReviewForm from './ReviewForm'

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  const { orderId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch đơn hàng + sản phẩm
  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items(*, products(id, name, slug, image_url))')
    .eq('id', orderId)
    .eq('user_id', user.id)
    .eq('status', 'delivered')
    .single()

  if (!order) notFound()

  const productIds = order.order_items?.map((i: any) => i.products?.id).filter(Boolean) ?? []

  //Check review dựa trên cả product_id và order_id
  const { data: existingReviews } = await supabase
    .from('reviews')
    .select('product_id')
    .eq('user_id', user.id)
    .eq('order_id', orderId)
    .in('product_id', productIds)

  const reviewedProductIds = new Set(existingReviews?.map((r) => r.product_id))

  const products = order.order_items
    ?.map((item: any) => item.products)
    .filter((p: any) => p && !reviewedProductIds.has(p.id))

  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      {/* Giữ nguyên Header tinh giản của Page cũ */}
      <div className="mb-16">
        <p className="text-mediumslateblue font-black text-xs uppercase tracking-[0.3em] mb-3">
          Feedback
        </p>
        <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-4">
          Đánh giá sản phẩm ⭐
        </h1>
        <p className="text-gray-400 font-mono text-sm">
          ORDER ID: {orderId.slice(0, 8).toUpperCase()}
        </p>
      </div>

      {/* Content Section: Giữ nguyên divide-y-2 */}
      {products && products.length > 0 ? (
        <div className="divide-y-2 divide-gray-50">
          {products.map((product: any) => (
            <div 
              key={product.id} 
              className="py-12 first:pt-0 last:pb-0"
            >
              {/*Truyền thêm orderId xuống ReviewForm */}
              <ReviewForm 
                product={product} 
                userId={user.id} 
                orderId={orderId} 
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="p-20 text-center">
          <div className="text-4xl mb-3">✅</div>
          <p className="text-gray-600 font-medium">
            Cảm ơn vì đã đánh giá!
          </p>
        </div>
      )}
    </main>
  )
}