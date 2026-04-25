'use server'

import { createClient } from '@/lib/supabase/server'
import { CartItem } from '@/store/cartStore'

type CreateOrderInput = {
  full_name: string
  phone: string
  address: string
  note?: string
  items: CartItem[]
  total: number
}

export async function createOrder(input: CreateOrderInput) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Chưa đăng nhập' }

  // 1. Tạo đơn hàng
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      total: input.total,
      status: 'pending',
      shipping_address: input.address,
      phone: input.phone,
      note: input.note,
    })
    .select()
    .single()

  if (orderError || !order) {
    return { success: false, error: orderError?.message }
  }

  // 2. Tạo order_items
  const orderItems = input.items.map((item) => ({
    order_id: order.id,
    product_id: item.id,
    quantity: item.quantity,
    unit_price: item.sale_price ?? item.price,
  }))

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)

  if (itemsError) {
    return { success: false, error: itemsError.message }
  }

  // 3. Giảm stock từng sản phẩm
  for (const item of input.items) {
    const { data: product } = await supabase
      .from('products')
      .select('stock')
      .eq('id', item.id)
      .single()

    if (product) {
      const newStock = Math.max(0, product.stock - item.quantity)
      await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', item.id)
    }
  }

  return { success: true, orderId: order.id }
}