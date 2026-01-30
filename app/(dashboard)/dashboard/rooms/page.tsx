'use client'

import { useState } from 'react'
import { useRooms, useCreateRoom, useUpdateRoom, useDeleteRoom } from '@/hooks/useRooms'
import { useProperties } from '@/hooks/useProperties'
import { Room } from '@/lib/types/database'
import { RoomFormInput, UpdateRoomInput } from '@/lib/validations/room'
import { RoomList } from '@/components/rooms/RoomList'
import { RoomForm } from '@/components/rooms/RoomForm'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Search, AlertTriangle } from 'lucide-react'

type DialogMode = 'closed' | 'create' | 'edit'

export default function RoomsPage() {
    const [dialogMode, setDialogMode] = useState<DialogMode>('closed')
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
    const [searchQuery, setSearchQuery] = useState('')

    // Fetch data
    const { data: propertiesData, isLoading: propertiesLoading } = useProperties()
    const properties = propertiesData?.data?.properties || []
    const defaultProperty = properties[0]

    const { data: roomsData, isLoading: roomsLoading } = useRooms({
        property_id: defaultProperty?.id,
        search: searchQuery || undefined,
    })
    const rooms = roomsData?.data?.rooms || []

    // Mutations
    const createRoom = useCreateRoom()
    const updateRoom = useUpdateRoom()
    const deleteRoom = useDeleteRoom()

    // Handlers
    const handleOpenCreate = () => {
        setSelectedRoom(null)
        setDialogMode('create')
    }

    const handleOpenEdit = (room: Room) => {
        setSelectedRoom(room)
        setDialogMode('edit')
    }

    const handleCloseDialog = () => {
        setDialogMode('closed')
        setSelectedRoom(null)
    }

    const handleSubmit = (data: RoomFormInput | UpdateRoomInput) => {
        if (dialogMode === 'create') {
            createRoom.mutate(data as RoomFormInput, {
                onSuccess: () => handleCloseDialog(),
            })
        } else if (dialogMode === 'edit' && selectedRoom) {
            updateRoom.mutate(
                { id: selectedRoom.id, data: data as UpdateRoomInput },
                { onSuccess: () => handleCloseDialog() }
            )
        }
    }

    const handleDelete = (room: Room) => {
        if (window.confirm(`Bạn có chắc muốn xóa phòng "${room.name}"?`)) {
            deleteRoom.mutate(room.id)
        }
    }

    const isLoading = propertiesLoading || roomsLoading
    const hasNoProperty = !propertiesLoading && properties.length === 0

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">Quản lý phòng</h1>
                    <p className="text-sm text-zinc-500 mt-1">
                        {rooms.length > 0
                            ? `${rooms.length} phòng`
                            : 'Thêm và quản lý các phòng trọ'}
                    </p>
                </div>

                <Button onClick={handleOpenCreate} disabled={hasNoProperty}>
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm phòng
                </Button>
            </div>

            {/* No Property Warning */}
            {hasNoProperty && (
                <Card className="border-amber-200 bg-amber-50">
                    <CardContent className="flex items-center gap-4 py-4">
                        <div className="rounded-full bg-amber-100 p-2">
                            <AlertTriangle className="h-5 w-5 text-amber-600" />
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-amber-800">
                                Bạn chưa có nhà trọ nào
                            </p>
                            <p className="text-sm text-amber-600">
                                Vui lòng tạo nhà trọ trước khi thêm phòng.
                            </p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                            <a href="/dashboard/settings">Tạo nhà trọ</a>
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Search */}
            {!hasNoProperty && (
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <Input
                        type="search"
                        placeholder="Tìm phòng..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            )}

            {/* Room List */}
            {!hasNoProperty && (
                <RoomList
                    rooms={rooms}
                    isLoading={isLoading}
                    onAddRoom={handleOpenCreate}
                    onEditRoom={handleOpenEdit}
                    onDeleteRoom={handleDelete}
                />
            )}

            {/* Create/Edit Form (shown as inline card for simplicity) */}
            {dialogMode !== 'closed' && defaultProperty && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <CardContent className="pt-6">
                            <RoomForm
                                room={selectedRoom}
                                propertyId={defaultProperty.id}
                                onSubmit={handleSubmit}
                                onCancel={handleCloseDialog}
                                isSubmitting={createRoom.isPending || updateRoom.isPending}
                            />
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
