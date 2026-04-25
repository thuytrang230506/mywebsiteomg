import { supabaseAdmin } from '@/lib/supabase/admin'
import Link from 'next/link'
import { deleteProduct } from './actions'

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams

  // Fetch danh mục để hiển thị filter
  const { data: categories } = await supabaseAdmin
    .from('categories')
    .select('id, name, slug')
    .order('name')

  // Fetch sản phẩm — lọc theo category nếu có
  let query = supabaseAdmin
    .from('products')
    .select('*, categories(id, name)')
    .order('created_at', { ascending: false })

  if (category) {
    const cat = categories?.find((c) => c.slug === category)
    if (cat) query = query.eq('category_id', cat.id)
  }

  const { data: products } = await query

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Sản phẩm</h1>
          <p className="text-sm text-gray-400 mt-0.5">{products?.length ?? 0} sản phẩm hiện có</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-1.5 bg-mediumslateblue text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition shadow-sm"
        >
          <span className="text-lg leading-none">+</span> Thêm sản phẩm
        </Link>
      </div>

      {/* Filter theo danh mục */}
      <div className="flex gap-2 flex-wrap bg-white p-2 rounded-2xl shadow-sm border border-gray-50">
        <Link
          href="/admin/products"
          className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
            !category
              ? 'bg-mediumslateblue text-white shadow-md shadow-mediumslateblue/20'
              : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          Tất cả
        </Link>
        {categories?.map((cat) => (
          <Link
            key={cat.id}
            href={`/admin/products?category=${cat.slug}`}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              category === cat.slug
                ? 'bg-mediumslateblue text-white shadow-md shadow-mediumslateblue/20'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {/* Bảng sản phẩm */}
      {!products || products.length === 0 ? (
        <div className="bg-white rounded-3xl p-20 text-center shadow-sm border border-gray-100">
          <div className="text-6xl mb-4">📦</div>
          <p className="text-gray-500 mb-6 font-medium">
            {category ? 'Không tìm thấy sản phẩm nào trong danh mục này' : 'Kho hàng của bạn đang trống'}
          </p>
          <Link
            href="/admin/products/new"
            className="inline-block bg-mediumslateblue text-white px-8 py-3 rounded-xl text-sm font-bold hover:opacity-90 transition shadow-lg shadow-mediumslateblue/20"
          >
            + Bắt đầu thêm sản phẩm
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50/50 border-b border-gray-100">
                <tr className="text-gray-400 uppercase text-[11px] tracking-widest font-bold">
                  <th className="px-6 py-4">Sản phẩm</th>
                  <th className="px-6 py-4">Danh mục</th>
                  <th className="px-6 py-4">Giá bán</th>
                  <th className="px-6 py-4 text-center">Tồn kho</th>
                  <th className="px-6 py-4 text-center">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/30 transition group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-800 group-hover:text-mediumslateblue transition-colors truncate max-w-[220px]">
                        {p.name}
                      </div>
                      <div className="text-[10px] font-mono text-gray-400 mt-0.5 uppercase">
                        ID: {p.id.slice(0, 8)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[11px] font-bold text-softperiwinkle border border-softperiwinkle/30 px-2 py-0.5 rounded-md uppercase tracking-tighter">
                        {p.categories?.name ?? 'Chưa phân loại'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{p.price.toLocaleString('vi-VN')}₫</div>
                      {p.sale_price && (
                        <div className="text-[10px] text-red-500 font-medium line-through decoration-red-300">
                          {p.sale_price.toLocaleString('vi-VN')}₫
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`font-mono font-bold ${p.stock <= 5 ? 'text-red-500' : 'text-gray-600'}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        p.is_active 
                        ? 'bg-green-50 text-green-600 border border-green-100' 
                        : 'bg-gray-100 text-gray-400'
                      }`}>
                        {p.is_active ? 'Đang bán' : 'Đã ẩn'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-4">
                        <Link
                          href={`/admin/products/${p.id}/edit`}
                          className="text-mediumslateblue font-bold hover:text-softperiwinkle text-xs transition"
                        >
                          SỬA
                        </Link>
                        <form action={async () => { 'use server'; await deleteProduct(p.id) }}>
                          <button 
                            type="submit" 
                            className="text-gray-300 font-bold hover:text-red-500 text-xs transition"
                          >
                            XÓA
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}