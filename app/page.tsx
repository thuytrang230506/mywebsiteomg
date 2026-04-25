import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/products/ProductCard'

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch danh mục
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .limit(6)

  // Fetch sản phẩm mới nhất
  const { data: newProducts } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(8)

  return (
    <main>
      {/* Banner hero */}
      <section className="bg-linear-to-r from-lavenderveil to-mediumslateblue text-white py-20 px-4 text-center">
        <h1 className="text-4xl font-bold mb-4"
        style={{textShadow: '1px 1px 2px rgba(0,0,0,0.5)'}}>
          Chào mừng đến với Dưa chuột không cá
        </h1>
        <p className="text-lg mb-8 opacity-90">Ở đây có mấy con lạ</p>
        <Link
          href="/products"
          className="bg-white text-mediumslateblue font-bold px-8 py-3 rounded-full hover:bg-blue-50 transition"
        >
          Mua đi nhé 😡
        </Link>
      </section>

      {/* Danh mục */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">Danh mục nổi bật</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {categories?.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="bg-lavendermist rounded-2xl p-4 text-center shadow-xl hover:shadow-2xl transition group"
            >
              <div className="w-12 h-12 bg-periwinkle rounded-full mx-auto mb-2 flex items-center justify-center text-2xl">
                {cat.icon}
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-mediumslateblue transition">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Sản phẩm mới nhất */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Sản phẩm mới nhất</h2>
          <Link href="/products" className="text-mediumslateblue hover:underline border-collapse text-sm ">
            Xem tất cả🌸
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {newProducts?.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </main>
  )
}