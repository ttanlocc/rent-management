'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    Building2,
    Users,
    Zap,
    FileText,
    LayoutDashboard,
} from 'lucide-react'

const navigation = [
    { name: 'Trang chủ', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Phòng', href: '/dashboard/rooms', icon: Building2 },
    { name: 'Người thuê', href: '/dashboard/tenants', icon: Users },
    { name: 'Điện nước', href: '/dashboard/utilities', icon: Zap },
    { name: 'Hóa đơn', href: '/dashboard/bills', icon: FileText },
]

interface BottomNavProps {
    className?: string
}

export function BottomNav({ className }: BottomNavProps) {
    const pathname = usePathname()

    return (
        <nav
            className={cn(
                'fixed bottom-0 left-0 right-0 z-50 flex lg:hidden items-center justify-around border-t bg-white/95 backdrop-blur-sm px-2 py-2 safe-area-bottom',
                className
            )}
        >
            {navigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                return (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                            'flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 transition-colors',
                            isActive
                                ? 'text-blue-600'
                                : 'text-zinc-500 hover:text-zinc-900'
                        )}
                    >
                        <item.icon
                            className={cn(
                                'h-5 w-5',
                                isActive && 'text-blue-600'
                            )}
                        />
                        <span className={cn(
                            'text-[10px] font-medium',
                            isActive && 'text-blue-600'
                        )}>
                            {item.name}
                        </span>
                    </Link>
                )
            })}
        </nav>
    )
}
