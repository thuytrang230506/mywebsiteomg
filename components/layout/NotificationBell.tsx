'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Notification = {
  id: string
  title: string
  message: string
  type: string
  order_id: string
  is_read: boolean
  created_at: string
}

export default function NotificationBell() {
  const router = useRouter()
  const supabase = createClient()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  async function fetchNotifications() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)
    setNotifications(data ?? [])
  }

  useEffect(() => {
    fetchNotifications()
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleClick(noti: Notification) {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', noti.id)
    setNotifications((prev) =>
      prev.map((n) => (n.id === noti.id ? { ...n, is_read: true } : n))
    )
    setOpen(false)
    if (noti.type === 'review') {
      router.push(`/review/${noti.order_id}`)
    } else {
      router.push('/account')
    }
  }

  async function markAllRead() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false)
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    // relative + inline-flex để dropdown không ảnh hưởng layout xung quanh
    <div ref={ref} className="relative inline-flex">
      {/* Nút chuông */}
      <button
        onClick={() => { setOpen(!open); if (!open) fetchNotifications() }}
        className="relative p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition"
        aria-label="Thông báo"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-xs min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center font-bold leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown — cố định width, không kéo dài trang */}
      {open && (
        <div
            className="absolute right-0 top-[calc(100%+8px)] bg-white rounded-2xl shadow-2xl border border-gray-100 z-[999]"
            style={{
            width: '360px',
            top: ref.current
            ? ref.current.getBoundingClientRect().bottom + 8
            : 64,
            right: 1,
            }}
        >
          {/* Header */}
          <div className="flex justify-between items-center px-5 py-3.5 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-800">Thông báo</span>
              {unreadCount > 0 && (
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} mới
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-blue-600 hover:text-blue-800 hover:underline transition"
              >
                Đọc tất cả
              </button>
            )}
          </div>

          {/* Danh sách — giới hạn chiều cao, cuộn nội dung bên trong */}
          <div
            className="overflow-y-auto"
            style={{ maxHeight: '400px' }}
          >
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 mb-2 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p className="text-sm">Chưa có thông báo nào</p>
              </div>
            ) : (
              notifications.map((noti) => (
                <button
                  key={noti.id}
                  onClick={() => handleClick(noti)}
                  className={`w-full text-left px-5 py-4 hover:bg-gray-50 active:bg-gray-100 transition border-b border-gray-50 last:border-0 ${
                    !noti.is_read ? 'bg-blue-50/60' : ''
                  }`}
                >
                  <div className="flex gap-3 items-start">
                    {/* Chấm xanh nếu chưa đọc */}
                    <div className="shrink-0 mt-1">
                      {!noti.is_read
                        ? <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                        : <div className="w-2.5 h-2.5 rounded-full bg-transparent" />
                      }
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-snug ${!noti.is_read ? 'font-semibold text-gray-900' : 'font-medium text-gray-600'}`}>
                        {noti.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        {noti.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1.5">
                        {new Date(noti.created_at).toLocaleString('vi-VN', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400">
                {notifications.length} thông báo · Cuộn để xem thêm
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}