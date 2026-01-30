import { Building2, Key, Users, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="flex h-16 items-center border-b px-8">
        <div className="flex items-center gap-2 font-bold text-xl text-primary">
          <Building2 className="h-6 w-6" />
          <span>RentManager</span>
        </div>
      </header>

      <main className="flex-1">
        <section className="px-8 py-24 text-center sm:py-32">
          <h1 className="text-5xl font-extrabold tracking-tight text-zinc-900 sm:text-6xl">
            Quản Lý Nhà Trọ <span className="text-blue-600">Thông Minh</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-600">
            Hệ thống quản lý phòng trọ, người thuê, và tự động hóa hóa đơn điện nước.
            Tiết kiệm thời gian, chính xác tuyệt đối.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <button className="rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-all">
              Bắt đầu ngay
            </button>
            <button className="text-sm font-semibold leading-6 text-zinc-900">
              Tìm hiểu thêm <span aria-hidden="true">→</span>
            </button>
          </div>
        </section>

        <section className="border-t bg-zinc-50 py-24">
          <div className="mx-auto max-w-7xl px-8">
            <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <Building2 className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-zinc-900">Quản Lý Phòng</h3>
                <p className="mt-2 text-sm text-zinc-600">Theo dõi trạng thái phòng, hợp đồng, và đặt cọc.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-600">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-zinc-900">Quản Lý Khách</h3>
                <p className="mt-2 text-sm text-zinc-600">Lưu trữ thông tin người thuê và lịch sử thanh toán.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100 text-yellow-600">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-zinc-900">Hóa Đơn Điện Nước</h3>
                <p className="mt-2 text-sm text-zinc-600">Tự động tính toán theo chỉ số công tơ điện nước hàng tháng.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                  <Key className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-zinc-900">Bảo Mật Cao</h3>
                <p className="mt-2 text-sm text-zinc-600">Dữ liệu được bảo mật với Supabase RLS và mã hóa.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-12 px-8 text-center text-zinc-400 text-sm">
        <p>&copy; 2026 RentManager. All rights reserved.</p>
      </footer>
    </div>
  );
}
