'use server'

import { supabaseAdmin } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function updateOrderStatus(orderId: string, status: string) {
  await supabaseAdmin.from('orders').update({ status }).eq('id', orderId)
  revalidatePath('/admin/orders')
}

export async function deleteAdminOrder(orderId: string) {
  await supabaseAdmin.from('orders').delete().eq('id', orderId)
  revalidatePath('/admin/orders')
}