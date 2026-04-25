import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/products/ProductCard'

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const supabase = await createClient()

  const { data: products } = q
    ? await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .ilike('name', `%${q}%`)   // ilike = tìm không phân biệt hoa thường
        .limit(24)
    : { data: [] }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">
        {q ? `Kết quả cho "${q}"` : 'Tìm kiếm'}
      </h1>
      <p className="text-gray-400 text-sm mb-6">Tìm thấy {products?.length ?? 0} sản phẩm</p>

      {products && products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          {q ? 'Không tìm thấy sản phẩm nào phù hợp.' : 'Nhập từ khóa để tìm kiếm.'}
        </div>
      )}
    </main>
  )
}