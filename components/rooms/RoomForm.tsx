'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { roomFormSchema, RoomFormInput, UpdateRoomInput } from '@/lib/validations/room'
import { Room } from '@/lib/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Building2, Loader2 } from 'lucide-react'

interface RoomFormProps {
    room?: Room | null
    propertyId: string
    onSubmit: (data: RoomFormInput | UpdateRoomInput) => void
    onCancel?: () => void
    isSubmitting?: boolean
}

export function RoomForm({
    room,
    propertyId,
    onSubmit,
    onCancel,
    isSubmitting,
}: RoomFormProps) {
    const isEditing = !!room

    // Use roomFormSchema for form validation (without defaults)
    const form = useForm<RoomFormInput>({
        resolver: zodResolver(roomFormSchema),
        defaultValues: {
            property_id: propertyId,
            name: room?.name || '',
            floor: room?.floor || 1,
            area: room?.area ?? undefined,
            base_rent: room?.base_rent || 0,
            status: (room?.status as 'vacant' | 'occupied') || 'vacant',
        },
    })

    const handleSubmit = (data: RoomFormInput) => {
        if (isEditing) {
            // For editing, only send the fields that can be updated
            const updateData: UpdateRoomInput = {
                name: data.name,
                floor: data.floor,
                area: data.area,
                base_rent: data.base_rent,
                status: data.status,
            }
            onSubmit(updateData)
        } else {
            onSubmit(data)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3 pb-4 border-b">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                        <Building2 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-zinc-900">
                            {isEditing ? 'Sửa phòng' : 'Thêm phòng mới'}
                        </h2>
                        <p className="text-sm text-zinc-500">
                            {isEditing
                                ? 'Cập nhật thông tin phòng'
                                : 'Nhập thông tin phòng mới'}
                        </p>
                    </div>
                </div>

                {/* Form fields */}
                <div className="grid gap-4 sm:grid-cols-2">
                    {/* Room Name */}
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem className="sm:col-span-2">
                                <FormLabel>Tên phòng *</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Ví dụ: Phòng 101, A01..."
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Floor */}
                    <FormField
                        control={form.control}
                        name="floor"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tầng</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min={1}
                                        placeholder="1"
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Area */}
                    <FormField
                        control={form.control}
                        name="area"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Diện tích (m²)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        placeholder="20"
                                        {...field}
                                        value={field.value ?? ''}
                                        onChange={(e) => {
                                            const value = e.target.value
                                            field.onChange(value ? parseFloat(value) : null)
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Base Rent */}
                    <FormField
                        control={form.control}
                        name="base_rent"
                        render={({ field }) => (
                            <FormItem className="sm:col-span-2">
                                <FormLabel>Giá thuê (đ/tháng) *</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="100000"
                                        placeholder="3000000"
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                    {onCancel && (
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={onCancel}
                            disabled={isSubmitting}
                        >
                            Hủy
                        </Button>
                    )}
                    <Button
                        type="submit"
                        className="flex-1"
                        disabled={isSubmitting}
                    >
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEditing ? 'Lưu thay đổi' : 'Thêm phòng'}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
