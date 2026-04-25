import { createClient } from '@supabase/supabase-js'

// Client này dùng Service Role Key — chỉ dùng phía server, không bao giờ expose ra client
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)