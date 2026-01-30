'use client'

import { Room, RoomWithTenant } from '@/lib/types/database'
import { formatCurrency, formatArea } from '@/lib/utils/formatters'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Building2, Users, Pencil, Trash2, MoreVertical } from 'lucide-react'

interface RoomCardProps {
    room: Room | RoomWithTenant
    onEdit?: (room: Room) => void
    onDelete?: (room: Room) => void
    onClick?: (room: Room) => void
}

export function RoomCard({ room, onEdit, onDelete, onClick }: RoomCardProps) {
    const isOccupied = room.status === 'occupied'
    const tenant = 'tenant' in room ? room.tenant : null

    return (
        <Card
            className={cn(
                'group relative cursor-pointer transition-all hover:shadow-md',
                onClick && 'hover:border-blue-200'
            )}
            onClick={() => onClick?.(room)}
        >
            <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                        <div
                            className={cn(
                                'flex h-10 w-10 items-center justify-center rounded-lg',
                                isOccupied ? 'bg-green-100' : 'bg-zinc-100'
                            )}
                        >
                            <Building2
                                className={cn(
                                    'h-5 w-5',
                                    isOccupied ? 'text-green-600' : 'text-zinc-500'
                                )}
                            />
                        </div>
                        <div>
                            <h3 className="font-semibold text-zinc-900">{room.name}</h3>
                            <p className="text-xs text-zinc-500">
                                Tầng {room.floor}
                                {room.area && ` • ${formatArea(room.area)}`}
                            </p>
                        </div>
                    </div>

                    {/* Status badge */}
                    <span
                        className={cn(
                            'rounded-full px-2 py-1 text-xs font-medium',
                            isOccupied
                                ? 'bg-green-100 text-green-700'
                                : 'bg-zinc-100 text-zinc-600'
                        )}
                    >
                        {isOccupied ? 'Đang thuê' : 'Trống'}
                    </span>
                </div>
            </CardHeader>

            <CardContent>
                {/* Rent */}
                <div className="mb-3">
                    <p className="text-2xl font-bold text-zinc-900">
                        {formatCurrency(room.base_rent)}
                    </p>
                    <p className="text-xs text-zinc-500">/tháng</p>
                </div>

                {/* Tenant info */}
                {tenant && tenant.is_active && (
                    <div className="flex items-center gap-2 rounded-lg bg-zinc-50 p-2">
                        <Users className="h-4 w-4 text-zinc-400" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-zinc-700 truncate">
                                {tenant.full_name}
                            </p>
                            {tenant.phone && (
                                <p className="text-xs text-zinc-500">{tenant.phone}</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Empty tenant placeholder */}
                {!isOccupied && (
                    <div className="flex items-center gap-2 rounded-lg border-2 border-dashed border-zinc-200 p-2 text-zinc-400">
                        <Users className="h-4 w-4" />
                        <p className="text-sm">Chưa có người thuê</p>
                    </div>
                )}

                {/* Actions */}
                <div className="mt-3 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                    {onEdit && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={(e) => {
                                e.stopPropagation()
                                onEdit(room)
                            }}
                        >
                            <Pencil className="mr-1 h-3 w-3" />
                            Sửa
                        </Button>
                    )}
                    {onDelete && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={(e) => {
                                e.stopPropagation()
                                onDelete(room)
                            }}
                            disabled={isOccupied}
                        >
                            <Trash2 className="mr-1 h-3 w-3" />
                            Xóa
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
