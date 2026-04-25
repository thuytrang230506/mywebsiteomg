'use client'

import Link from 'next/link'
import { useCartStore } from '@/store/cartStore'
import {Roboto} from 'next/font/google';
const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto',
});
export default function CartBadge() {
  const totalItems = useCartStore((state) => state.totalItems())

  return (
    <Link href="/cart" className="relative text-sm text-gray-600 hover:text-softperiwinkle">
      🛒 Giỏ hàng
      {totalItems > 0 && (
        <span className="absolute -top-2 -right-3 bg-mediumslateblue text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
    </Link>
  )
}