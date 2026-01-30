'use client'

import { Menu, Bell, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface HeaderProps {
    onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
    return (
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-white/95 backdrop-blur-sm px-4 lg:px-6">
            {/* Left: Mobile menu + Title */}
            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    onClick={onMenuClick}
                    aria-label="Mở menu"
                >
                    <Menu className="h-5 w-5" />
                </Button>

                <h1 className="text-lg font-semibold text-zinc-900 lg:hidden">
                    RentManager
                </h1>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {/* Notification badge - uncomment when needed */}
                    {/* <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" /> */}
                </Button>

                {/* User menu */}
                <Link href="/dashboard/settings">
                    <Button variant="ghost" size="icon">
                        <User className="h-5 w-5" />
                    </Button>
                </Link>
            </div>
        </header>
    )
}
