import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/products/ProductCard'
import Link from 'next/link'

type SearchParams = {
  category?: string
  sort?: string
  page?: string
  min_price?: string
  max_price?: string
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const page = Number(params.page ?? 1)
  const pageSize = 12
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  // Fetch danh mục để hiển thị filter
  const { data: categories } = await supabase.from('categories').select('*')

  // Build query sản phẩm
  let query = supabase
    .from('products')
    .select('*, categories(name, slug)', { count: 'exact' })
    .eq('is_active', true)
    .range(from, to)

  // Lọc theo danh mục
  if (params.category) {
    const cat = categories?.find((c) => c.slug === params.category)
    if (cat) query = query.eq('category_id', cat.id)
  }

  // Lọc theo giá
  if (params.min_price) query = query.gte('price', Number(params.min_price))
  if (params.max_price) query = query.lte('price', Number(params.max_price))

  // Sắp xếp
  switch (params.sort) {
    case 'price_asc':  query = query.order('price', { ascending: true }); break
    case 'price_desc': query = query.order('price', { ascending: false }); break
    case 'newest':     query = query.order('created_at', { ascending: false }); break
    default:           query = query.order('created_at', { ascending: false })
  }

  const { data: products, count } = await query
  const totalPages = Math.ceil((count ?? 0) / pageSize)

  // Helper tạo URL với params mới
  function buildUrl(newParams: Record<string, string | undefined>) {
    const merged = { ...params, ...newParams, page: '1' }
    const qs = Object.entries(merged)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
      .join('&')
    return `/products${qs ? '?' + qs : ''}`
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Tất cả sản phẩm</h1>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar filter */}
        <aside className="w-full md:w-56 shrink-0 space-y-6">
          {/* Filter danh mục */}
          <div>
            <h3 className="font-semibold mb-3 text-gray-700">Danh mục</h3>
            <div className="space-y-1">
              <Link
                href={buildUrl({ category: undefined })}
                className={`block text-sm px-3 py-2 rounded-lg hover:bg-lavendermist ${!params.category ? 'bg-lavenderveil text-mediumslateblue font-medium' : 'text-gray-600'}`}
              >
                Tất cả
              </Link>
              {categories?.map((cat) => (
                <Link
                  key={cat.id}
                  href={buildUrl({ category: cat.slug })}
                  className={`block text-sm px-3 py-2 rounded-lg hover:bg-lavendermist ${params.category === cat.slug ? 'bg-lavenderveil text-mediumslateblue font-medium' : 'text-gray-600'}`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Filter giá */}
          <div>
            <h3 className="font-semibold mb-3 text-gray-700">Khoảng giá</h3>
            <div className="space-y-1">
              {[
                {label: 'Tất cả', min: undefined, max: undefined}, 
                { label: 'Dưới 1 triệu', max: '1000000' },
                { label: '1 – 5 triệu', min: '1000000', max: '5000000' },
                { label: '5 – 20 triệu', min: '5000000', max: '20000000' },
                { label: 'Trên 20 triệu', min: '20000000' },
              ].map((range) => (
                <Link
                  key={range.label}
                  href={buildUrl({ min_price: range.min, max_price: range.max })}
                  className="block text-sm px-3 py-2 rounded-lg hover:bg-lavendermist text-gray-600"
                >
                  {range.label}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* Nội dung chính */}
        <div className="flex-1">
          {/* Sort bar */}
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500">{count} sản phẩm</p>
            <div className="flex gap-2">
              {[
                { label: 'Mới nhất', value: 'newest' },
                { label: 'Giá tăng dần', value: 'price_asc' },
                { label: 'Giá giảm dần', value: 'price_desc' },
              ].map((opt) => (
                <Link
                  key={opt.value}
                  href={buildUrl({ sort: opt.value })}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition ${params.sort === opt.value ? 'bg-mediumslateblue text-white border-mediumslateblue' : 'border-gray-200 text-gray-600 hover:border-mediumslateblue'}`}
                >
                  {opt.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Grid sản phẩm */}
          {products && products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400">
              Không tìm thấy sản phẩm nào
            </div>
          )}

          {/* Phân trang */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={buildUrl({ page: String(p) })}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium ${p === page ? 'bg-mediumslateblue text-white' : 'border border-gray-200 text-gray-600 hover:border-blue-400'}`}
                >
                  {p}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}