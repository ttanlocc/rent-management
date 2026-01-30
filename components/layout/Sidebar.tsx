'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    Building2,
    Users,
    Zap,
    FileText,
    Settings,
    LayoutDashboard,
    ChevronLeft,
} from 'lucide-react'
import { useState } from 'react'

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Phòng', href: '/dashboard/rooms', icon: Building2 },
    { name: 'Người thuê', href: '/dashboard/tenants', icon: Users },
    { name: 'Điện nước', href: '/dashboard/utilities', icon: Zap },
    { name: 'Hóa đơn', href: '/dashboard/bills', icon: FileText },
    { name: 'Cài đặt', href: '/dashboard/settings', icon: Settings },
]

interface SidebarProps {
    className?: string
}

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname()
    const [collapsed, setCollapsed] = useState(false)

    return (
        <aside
            className={cn(
                'hidden lg:flex flex-col border-r bg-white transition-all duration-300',
                collapsed ? 'w-16' : 'w-64',
                className
            )}
        >
            {/* Logo */}
            <div className="flex h-16 items-center justify-between border-b px-4">
                {!collapsed && (
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <Building2 className="h-6 w-6 text-blue-600" />
                        <span className="font-bold text-lg">RentManager</span>
                    </Link>
                )}
                {collapsed && (
                    <Link href="/dashboard">
                        <Building2 className="h-6 w-6 text-blue-600 mx-auto" />
                    </Link>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-1.5 rounded-md hover:bg-zinc-100 transition-colors"
                    aria-label={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
                >
                    <ChevronLeft
                        className={cn(
                            'h-4 w-4 text-zinc-500 transition-transform',
                            collapsed && 'rotate-180'
                        )}
                    />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-2">
                {navigation.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900',
                                collapsed && 'justify-center px-2'
                            )}
                            title={collapsed ? item.name : undefined}
                        >
                            <item.icon className={cn('h-5 w-5 shrink-0', isActive && 'text-blue-600')} />
                            {!collapsed && <span>{item.name}</span>}
                        </Link>
                    )
                })}
            </nav>

            {/* Footer */}
            {!collapsed && (
                <div className="border-t p-4">
                    <p className="text-xs text-zinc-400 text-center">
                        © 2026 RentManager
                    </p>
                </div>
            )}
        </aside>
    )
}
