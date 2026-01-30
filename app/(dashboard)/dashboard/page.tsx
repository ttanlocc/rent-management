import { Building2, Users, Zap, FileText, TrendingUp, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function DashboardPage() {
    // TODO: Fetch real stats from API
    const stats = [
        {
            title: 'Tổng số phòng',
            value: '0',
            icon: Building2,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            href: '/dashboard/rooms',
        },
        {
            title: 'Người thuê',
            value: '0',
            icon: Users,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            href: '/dashboard/tenants',
        },
        {
            title: 'Hóa đơn chờ',
            value: '0',
            icon: FileText,
            color: 'text-amber-600',
            bgColor: 'bg-amber-50',
            href: '/dashboard/bills',
        },
        {
            title: 'Doanh thu tháng',
            value: '0 đ',
            icon: TrendingUp,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            href: '/dashboard/bills',
        },
    ]

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-zinc-900">Tổng quan</h1>
                <p className="text-sm text-zinc-500 mt-1">
                    Chào mừng bạn đến với RentManager
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Link key={stat.title} href={stat.href}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-zinc-500">
                                    {stat.title}
                                </CardTitle>
                                <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Thao tác nhanh</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
                            <Link href="/dashboard/rooms/new">
                                <Building2 className="h-5 w-5 text-blue-600" />
                                <span>Thêm phòng</span>
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
                            <Link href="/dashboard/tenants/new">
                                <Users className="h-5 w-5 text-green-600" />
                                <span>Thêm người thuê</span>
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
                            <Link href="/dashboard/utilities">
                                <Zap className="h-5 w-5 text-amber-600" />
                                <span>Nhập điện nước</span>
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
                            <Link href="/dashboard/bills">
                                <FileText className="h-5 w-5 text-purple-600" />
                                <span>Xuất hóa đơn</span>
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Getting Started (show when no rooms) */}
            <Card className="border-dashed border-2 border-zinc-200 bg-zinc-50/50">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-blue-100 p-4 mb-4">
                        <AlertCircle className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-900 mb-2">
                        Bắt đầu sử dụng RentManager
                    </h3>
                    <p className="text-sm text-zinc-500 max-w-md mb-6">
                        Để bắt đầu quản lý nhà trọ, hãy thêm phòng đầu tiên của bạn.
                        Sau đó bạn có thể thêm người thuê và bắt đầu quản lý điện nước, hóa đơn.
                    </p>
                    <Button asChild>
                        <Link href="/dashboard/rooms/new">
                            <Building2 className="h-4 w-4 mr-2" />
                            Thêm phòng đầu tiên
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
