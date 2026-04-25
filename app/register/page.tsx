'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { z } from 'zod'

// Định nghĩa Schema
const registerSchema = z.object({
  full_name: z.string().min(2, 'Họ tên tối thiểu 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  password: z
    .string()
    .min(6, 'Mật khẩu tối thiểu 6 ký tự')
    .refine((value) => !/\s/.test(value), {
      message: 'Mật khẩu không được chứa khoảng trắng',
    }),
})

// Tạo type từ schema để dùng cho Form
type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [form, setForm] = useState<RegisterForm>({ 
    full_name: '', 
    email: '', 
    password: '' 
  })
  
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterForm, string>>>({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  // Danh sách các trường input được định nghĩa rõ ràng về type
  const inputFields: { 
    name: keyof RegisterForm; 
    label: string; 
    type: string; 
    placeholder: string 
  }[] = [
    { name: 'full_name', label: 'Họ và tên', type: 'text', placeholder: 'Nguyễn Văn A' },
    { name: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
    { name: 'password', label: 'Mật khẩu', type: 'password', placeholder: '••••••••' },
  ]

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setServerError('')

    const result = registerSchema.safeParse(form)
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof RegisterForm, string>> = {}
      
      // Sử dụng result.error.issues hoặc result.error.flatten() sẽ chuẩn hơn
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as keyof RegisterForm
        if (path) {
          fieldErrors[path] = issue.message
        }
      })

      setErrors(fieldErrors)
      setLoading(false)
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })

    if (error) {
      setServerError(error.message)
      setLoading(false)
      return
    }

    if (data.user) {
      await supabase.from('users').upsert({
        id: data.user.id,
        full_name: form.full_name,
      })
    }

    router.push('/login?registered=1')
    setLoading(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Tạo tài khoản</h1>
        <p className="text-gray-400 text-sm mb-6">
          Đã có tài khoản?{' '}
          <Link href="/login" className="text-mediumslateblue hover:underline">
            Đăng nhập
          </Link>
        </p>

        {serverError && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {inputFields.map((field) => (
            <div key={field.name}>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                {field.label}
              </label>
              <input
                name={field.name}
                type={field.type}
                value={form[field.name]}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 transition-all"
                placeholder={field.placeholder}
              />
              {errors[field.name] && (
                <p className="text-red-500 text-xs mt-1">{errors[field.name]}</p>
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-mediumslateblue text-white py-3 rounded-xl font-semibold hover:bg-softperiwinkle disabled:opacity-60 transition-all active:scale-[0.98]"
          >
            {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
          </button>
        </form>
      </div>
    </main>
  )
}