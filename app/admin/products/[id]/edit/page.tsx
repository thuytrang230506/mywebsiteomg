import { supabaseAdmin } from '@/lib/supabase/admin'
import ProductForm from '../../ProductForm'
import { notFound } from 'next/navigation'

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [{ data: product }, { data: categories }] = await Promise.all([
    supabaseAdmin.from('products').select('*').eq('id', id).single(),
    supabaseAdmin.from('categories').select('id, name'),
  ])

  if (!product) notFound()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Sửa sản phẩm</h1>
      <ProductForm categories={categories ?? []} product={product} />
    </div>
  )
}