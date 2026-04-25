import { supabaseAdmin } from '@/lib/supabase/admin'
import ProductForm from '../ProductForm'
import Link from 'next/link'

export default async function NewProductPage() {
  const { data: categories } = await supabaseAdmin
    .from('categories')
    .select('id, name')
    .order('name')

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Breadcrumb / Navigation quay lại */}
      <nav className="flex items-center gap-2 text-sm">
        <Link 
          href="/admin/products" 
          className="text-gray-400 hover:text-mediumslateblue transition-colors font-medium"
        >
          Sản phẩm
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-mediumslateblue font-bold">Thêm mới</span>
      </nav>

      {/* Header */}
      <div className="border-b border-gray-100 pb-1">
        <h1 className="text-3xl font-black text-gray-800 tracking-tight">
          📦 Thêm sản phẩm mới
        </h1>
        <p className="text-gray-400 mt-2 font-medium">
          Điền đầy đủ thông tin để hiển thị sản phẩm lên kệ hàng của <span className="text-mediumslateblue font-bold">Dưa chuột không cá</span>.
        </p>
      </div>

      {/* Form Container */}

        <ProductForm categories={categories ?? []} />
    </div>
  )
}