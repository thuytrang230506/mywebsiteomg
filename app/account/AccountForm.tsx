'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Profile = {
  full_name?: string | null
  phone?: string | null
  address?: string | null
}

export default function AccountForm({ profile, userId }: { profile: Profile | null, userId: string }) {
  const supabase = createClient()
  const [form, setForm] = useState({
    full_name: profile?.full_name ?? '',
    phone: profile?.phone ?? '',
    address: profile?.address ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setSaving(true)
    await supabase.from('users').upsert({ id: userId, ...form })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-50">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-xl">📝</span>
        <h2 className="font-black text-xl text-gray-800 uppercase tracking-tighter">Thông tin cá nhân</h2>
      </div>

      <div className="space-y-6">
        {[
          { key: 'full_name', label: 'Họ và tên của bạn', placeholder: 'VD: Nguyễn Văn A' },
          { key: 'phone', label: 'Số điện thoại liên hệ', placeholder: 'VD: 0912345678' },
          { key: 'address', label: 'Địa chỉ nhận hàng', placeholder: 'Số nhà, đường, quận, tỉnh...' },
        ].map((field) => (
          <div key={field.key}>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">
              {field.label}
            </label>
            <input
              value={form[field.key as keyof typeof form]}
              onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
              className="w-full border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold text-gray-700 focus:outline-none focus:border-mediumslateblue focus:ring-4 focus:ring-mediumslateblue/5 transition-all bg-gray-50/50"
              placeholder={field.placeholder}
            />
          </div>
        ))}

        <button
          onClick={handleSave}
          disabled={saving}
          className={`w-full md:w-auto px-6 py-4 rounded-2xl font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-lg shadow-mediumslateblue/20 ${
            saved 
              ? 'bg-green-500 text-white shadow-green-200' 
              : 'bg-mediumslateblue hover:shadow-mediumslateblue/40 text-white'
          } disabled:opacity-60`}
        >
          {saved ? '✓ Đã cập nhật thành công!' : saving ? 'Đang lưu...' : 'Lưu thay đổi ngay'}
        </button>
      </div>
    </div>
  )
}