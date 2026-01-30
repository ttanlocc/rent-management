'use client'

import { Building2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface RoomEmptyStateProps {
    onAddRoom?: () => void
}

export function RoomEmptyState({ onAddRoom }: RoomEmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 py-16 px-6 text-center">
            {/* Icon */}
            <div className="mb-6 rounded-full bg-blue-100 p-6">
                <Building2 className="h-12 w-12 text-blue-600" />
            </div>

            {/* Text */}
            <h3 className="mb-2 text-xl font-semibold text-zinc-900">
                Chưa có phòng nào
            </h3>
            <p className="mb-6 max-w-sm text-sm text-zinc-500">
                Bắt đầu bằng cách thêm phòng đầu tiên của bạn. Bạn có thể thêm thông tin
                như tên phòng, tầng, diện tích, và giá thuê.
            </p>

            {/* CTA */}
            {onAddRoom && (
                <Button onClick={onAddRoom}>
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm phòng đầu tiên
                </Button>
            )}
        </div>
    )
}
