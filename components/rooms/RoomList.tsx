'use client'

import { Room, RoomWithTenant } from '@/lib/types/database'
import { RoomCard } from './RoomCard'
import { RoomEmptyState } from './RoomEmptyState'
import { Skeleton } from '@/components/ui/skeleton'

interface RoomListProps {
    rooms: RoomWithTenant[]
    isLoading?: boolean
    onAddRoom?: () => void
    onEditRoom?: (room: Room) => void
    onDeleteRoom?: (room: Room) => void
    onRoomClick?: (room: Room) => void
}

export function RoomList({
    rooms,
    isLoading,
    onAddRoom,
    onEditRoom,
    onDeleteRoom,
    onRoomClick,
}: RoomListProps) {
    // Loading skeleton
    if (isLoading) {
        return (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <RoomCardSkeleton key={i} />
                ))}
            </div>
        )
    }

    // Empty state
    if (rooms.length === 0) {
        return <RoomEmptyState onAddRoom={onAddRoom} />
    }

    // Room grid
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
                <RoomCard
                    key={room.id}
                    room={room}
                    onEdit={onEditRoom}
                    onDelete={onDeleteRoom}
                    onClick={onRoomClick}
                />
            ))}
        </div>
    )
}

function RoomCardSkeleton() {
    return (
        <div className="rounded-xl border bg-white p-4">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div>
                        <Skeleton className="h-4 w-20 mb-1" />
                        <Skeleton className="h-3 w-16" />
                    </div>
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-8 w-24 mb-1" />
            <Skeleton className="h-3 w-12 mb-3" />
            <Skeleton className="h-12 w-full rounded-lg" />
        </div>
    )
}
