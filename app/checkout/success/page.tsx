import Link from 'next/link'

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string }>
}) {
  const { order_id } = await searchParams

  return (
    <main className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="text-6xl mb-4">🎉</div>
      <h1 className="text-2xl font-bold mb-2">Đặt hàng thành công!</h1>
      <p className="text-gray-500 mb-2">
        Cảm ơn bạn đã mua hàng. Chúng tôi sẽ liên hệ xác nhận sớm nhất.
      </p>
      {order_id && (
        <p className="text-sm text-gray-400 mb-8">
          Mã đơn hàng: <span className="font-mono font-medium text-gray-600">{order_id}</span>
        </p>
      )}
      <div className="flex gap-3 justify-center">
        <Link
          href="/account"
          className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition"
        >
          Xem đơn hàng
        </Link>
        <Link
          href="/products"
          className="border border-gray-200 text-gray-600 px-6 py-2.5 rounded-xl hover:border-gray-400 transition"
        >
          Tiếp tục mua sắm
        </Link>
      </div>
    </main>
  )
}