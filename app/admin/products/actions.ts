'use server'

import { supabaseAdmin } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const productSchema = z.object({
  name:        z.string().min(2),
  slug:        z.string().min(2),
  description: z.string().optional(),
  price:       z.coerce.number().positive(),
  sale_price:  z.coerce.number().positive().optional().or(z.literal('')),
  stock:       z.coerce.number().int().min(0),
  category_id: z.string().uuid('Chọn danh mục'),
  is_active:   z.coerce.boolean().optional(),
})

export async function createProduct(formData: FormData) {
  const raw = Object.fromEntries(formData)
  const parsed = productSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { sale_price, ...rest } = parsed.data
  const { error } = await supabaseAdmin.from('products').insert({
    ...rest,
    sale_price: sale_price || null,
    is_active: raw.is_active === 'on',
  })

  if (error) return { error: error.message }
  revalidatePath('/admin/products')
  return { success: true }
}

export async function updateProduct(id: string, formData: FormData) {
  const raw = Object.fromEntries(formData)
  const parsed = productSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { sale_price, ...rest } = parsed.data
  const { error } = await supabaseAdmin.from('products').update({
    ...rest,
    sale_price: sale_price || null,
    is_active: raw.is_active === 'on',
  }).eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/admin/products')
  return { success: true }
}

export async function deleteProduct(id: string) {
  await supabaseAdmin.from('products').delete().eq('id', id)
  revalidatePath('/admin/products')
}

export async function uploadProductImage(formData: FormData) {
  const file = formData.get('file') as File
  if (!file) return { error: 'Không có file' }

  const ext = file.name.split('.').pop()
  const fileName = `${Date.now()}.${ext}`
  const buffer = await file.arrayBuffer()

  const { error } = await supabaseAdmin.storage
    .from('products')
    .upload(fileName, buffer, { contentType: file.type })

  if (error) return { error: error.message }

  const { data } = supabaseAdmin.storage.from('products').getPublicUrl(fileName)
  return { url: data.publicUrl }
}

// Thêm mới: tạo category
export async function createCategory({ name, slug }: { name: string; slug: string }) {
  const { data: category, error } = await supabaseAdmin
    .from('categories')
    .insert({ name, slug })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/admin/products')
  return { category }
}