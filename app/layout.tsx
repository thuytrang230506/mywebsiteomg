import Navbar from '@/components/layout/Navbar'
import './globals.css'
// 1. Import Roboto
import { Roboto } from 'next/font/google';

// 2. Khởi tạo font Roboto
const roboto = Roboto({
  weight: ['400', '500', '700'], // Các độ đậm bạn muốn dùng
  subsets: ['latin', 'vietnamese'], // Bắt buộc có vietnamese để không lỗi dấu tiếng Việt
  display: 'swap',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      {/* 3. Gán roboto.className vào body */}
      <body className={roboto.className}>
        <Navbar />
        {children}
      </body>
    </html>
  )
}