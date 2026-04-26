'use server'
 
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
 
export async function deleteOrder(orderId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Chưa đăng nhập' }
 
  // Chỉ được xóa đơn đã hủy của mình (RLS cũng bảo vệ thêm)
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', orderId)
    .eq('user_id', user.id)
    .eq('status', 'cancelled')
 
  if (error) return { error: error.message }
  revalidatePath('/account')
  return { success: true }
}