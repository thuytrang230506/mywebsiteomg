'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createProduct, updateProduct, createCategory } from './actions'

type Category = { id: string; name: string }
type Product = {
  id?: string; name?: string; slug?: string; description?: string
  price?: number; sale_price?: number | null; stock?: number
  category_id?: string; is_active?: boolean; image_url?: string | null
}

export default function ProductForm({
  categories: initialCategories,
  product,
}: {
  categories: Category[]
  product?: Product
}) {
  const router = useRouter()
  const isEdit = !!product?.id

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? '')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')

  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [selectedCategoryId, setSelectedCategoryId] = useState(product?.category_id ?? '')
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [creatingCategory, setCreatingCategory] = useState(false)

  // Upload ảnh qua API Route với style mới
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadProgress('Đang tải lên...')
    setError('')

    const fd = new FormData()
    fd.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: fd,
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Upload thất bại')
      } else {
        setImageUrl(data.url)
        setUploadProgress('Tải lên thành công ✓')
        setTimeout(() => setUploadProgress(''), 2000)
      }
    } catch {
      setError('Lỗi kết nối khi upload ảnh')
    } finally {
      setUploading(false)
    }
  }

  function removeImage() {
    setImageUrl('')
    setUploadProgress('')
  }

  async function handleCreateCategory() {
    if (!newCategoryName.trim()) return
    setCreatingCategory(true)

    const slug = newCategoryName
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')

    const result = await createCategory({ name: newCategoryName.trim(), slug })

    if (result.error) {
      setError(result.error)
    } else if (result.category) {
      setCategories((prev) => [...prev, result.category!])
      setSelectedCategoryId(result.category.id)
      setNewCategoryName('')
      setShowNewCategory(false)
    }
    setCreatingCategory(false)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    if (!selectedCategoryId) {
      setError('Vui lòng chọn danh mục cho sản phẩm')
      return
    }

    setLoading(true)
    const fd = new FormData(e.currentTarget)
    if (imageUrl) fd.set('image_url', imageUrl)
    fd.set('category_id', selectedCategoryId)

    const result = isEdit
      ? await updateProduct(product!.id!, fd)
      : await createProduct(fd)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push('/admin/products')
    }
  }

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const slugInput = document.getElementById('slug') as HTMLInputElement
    if (slugInput && !isEdit) {
      slugInput.value = e.target.value
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100 font-medium animate-in fade-in zoom-in duration-200">
          ⚠️ {error}
        </div>
      )}

      {/* Khu vực Upload ảnh - Style Dưa Chuột */}
      <div className="p-6 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200 transition-all hover:border-softperiwinkle/50">
        <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-4 ml-1">Hình ảnh sản phẩm</label>
        
        <div className="flex items-start gap-6">
          {imageUrl ? (
            <div className="relative group shrink-0">
              <img 
                src={imageUrl} 
                className="w-32 h-32 object-cover rounded-2xl border-4 border-white shadow-xl" 
                alt="preview" 
              />
              <button 
                type="button" 
                onClick={removeImage}
                className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-red-600 transition-transform hover:scale-110 active:scale-90"
              >
                ✕
              </button>
            </div>
          ) : (
            <label className="w-32 h-32 bg-white rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-softperiwinkle/5 transition group">
              <span className="text-3xl group-hover:scale-110 transition-transform">📷</span>
              <span className="text-[10px] font-black text-gray-400 uppercase mt-2">Chọn ảnh</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          )}

          <div className="flex-1 space-y-2 pt-2">
            {imageUrl && (
              <label className="inline-block cursor-pointer bg-white border border-gray-200 px-4 py-2 rounded-xl text-xs font-bold text-mediumslateblue hover:bg-gray-50 transition shadow-sm">
                Đổi ảnh khác
                <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="hidden" />
              </label>
            )}
            
            {uploading && (
              <div className="flex items-center gap-2 text-mediumslateblue font-black text-xs animate-pulse">
                <span className="w-2 h-2 bg-mediumslateblue rounded-full animate-bounce"></span>
                {uploadProgress}
              </div>
            )}
            
            {uploadProgress && !uploading && (
              <p className="text-xs font-bold text-green-500">{uploadProgress}</p>
            )}
            
            <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
              Dung lượng tối đa: 5MB<br />
              Định dạng: JPG, PNG, WEBP
            </p>
          </div>
        </div>
      </div>

      {/* Grid thông tin chính */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="text-xs font-black text-gray-500 uppercase tracking-widest block mb-2 ml-1">Tên sản phẩm *</label>
          <input
            name="name"
            type="text"
            required
            defaultValue={product?.name}
            onChange={handleNameChange}
            placeholder="VD: Dưa chuột hữu cơ loại 1"
            className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-mediumslateblue focus:ring-4 focus:ring-mediumslateblue/5 transition-all font-bold"
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-xs font-black text-gray-500 uppercase tracking-widest block mb-2 ml-1">Đường dẫn (Slug) *</label>
          <input
            name="slug"
            id="slug"
            type="text"
            required
            defaultValue={product?.slug}
            className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-mediumslateblue bg-gray-50 font-mono font-bold text-gray-500"
          />
        </div>

        <div>
          <label className="text-xs font-black text-gray-500 uppercase tracking-widest block mb-2 ml-1">Giá bán (₫) *</label>
          <input
            name="price"
            type="number"
            required
            min={0}
            defaultValue={product?.price}
            className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-mediumslateblue font-black text-lg"
          />
        </div>

        <div>
          <label className="text-xs font-black text-gray-500 uppercase tracking-widest block mb-2 ml-1">Giá giảm (₫)</label>
          <input
            name="sale_price"
            type="number"
            min={0}
            defaultValue={product?.sale_price ?? ''}
            className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-mediumslateblue font-black text-lg text-red-500"
          />
        </div>

        <div>
          <label className="text-xs font-black text-gray-500 uppercase tracking-widest block mb-2 ml-1">Tồn kho *</label>
          <input
            name="stock"
            type="number"
            required
            min={0}
            defaultValue={product?.stock ?? 0}
            className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-mediumslateblue font-bold"
          />
        </div>

        {/* Danh mục dropdown */}
        <div>
          <label className="text-xs font-black text-gray-500 uppercase tracking-widest block mb-2 ml-1">Danh mục *</label>
          <div className="flex gap-2">
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="flex-1 border border-gray-200 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-mediumslateblue font-bold appearance-none bg-white"
            >
              <option value="">Chọn danh mục</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setShowNewCategory(!showNewCategory)}
              className="px-4 py-4 border-2 border-dotted border-softperiwinkle text-mediumslateblue rounded-2xl text-xs font-black hover:bg-softperiwinkle/10 transition uppercase"
            >
              + Mới
            </button>
          </div>
        </div>
      </div>

      {/* Tạo category nhanh */}
      {showNewCategory && (
        <div className="p-6 bg-mediumslateblue/[0.03] rounded-[2rem] border-2 border-mediumslateblue/10 animate-in slide-in-from-top-2">
          <p className="text-[10px] font-black text-mediumslateblue uppercase tracking-widest mb-3">Tạo nhanh danh mục mới</p>
          <div className="flex gap-3">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Tên danh mục..."
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-mediumslateblue"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreateCategory())}
            />
            <button
              type="button"
              onClick={handleCreateCategory}
              disabled={creatingCategory || !newCategoryName.trim()}
              className="bg-mediumslateblue text-white px-6 py-3 rounded-xl text-sm font-black hover:opacity-90 disabled:opacity-50 transition shadow-lg shadow-mediumslateblue/20"
            >
              {creatingCategory ? '...' : 'Tạo'}
            </button>
          </div>
        </div>
      )}

      {/* Mô tả */}
      <div>
        <label className="text-xs font-black text-gray-500 uppercase tracking-widest block mb-2 ml-1">Mô tả sản phẩm</label>
        <textarea
          name="description"
          defaultValue={product?.description ?? ''}
          rows={5}
          placeholder="Viết vài lời giới thiệu về sản phẩm này..."
          className="w-full border border-gray-200 rounded-[2rem] px-6 py-5 text-sm focus:outline-none focus:border-mediumslateblue transition-all resize-none font-medium leading-relaxed"
        />
      </div>

      {/* Toggles */}
      <label className="flex items-center gap-3 cursor-pointer group w-fit select-none">
        <div className="relative">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={product?.is_active ?? true}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-mediumslateblue"></div>
        </div>
        <span className="text-sm font-bold text-gray-500 group-hover:text-mediumslateblue transition">Hiển thị sản phẩm trên web</span>
      </label>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-6 border-t border-gray-100">
        <button
          type="submit"
          disabled={loading || uploading}
          className="flex-1 bg-mediumslateblue text-white px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-[0.2em] hover:shadow-xl hover:shadow-mediumslateblue/30 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? 'Đang lưu hệ thống...' : isEdit ? '✓ Cập nhật sản phẩm' : '✓ Thêm sản phẩm ngay'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/products')}
          className="px-8 py-4 rounded-2xl text-sm font-black text-gray-400 hover:bg-gray-100 transition active:scale-95"
        >
          Hủy
        </button>
      </div>
    </form>
  )
}