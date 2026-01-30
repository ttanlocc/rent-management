'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { tenantFormSchema, TenantFormInput, UpdateTenantInput } from '@/lib/validations/tenant'
import { useRooms } from '@/hooks/useRooms'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from '@/components/ui/form'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
// I'll use Select for status: "Đang thuê" vs "Đã rời đi"

import { Loader2, User, Phone, Mail, FileText, Home, Calendar } from 'lucide-react'

// I need to check if Switch or Checkbox exists. 
// To be safe and fast, I will validly use a simple Select for status.

interface TenantFormProps {
    tenant?: any // Replace with proper type
    propertyId: string
    onSubmit: (data: TenantFormInput | UpdateTenantInput) => void
    onCancel?: () => void
    isSubmitting?: boolean
}

export function TenantForm({
    tenant,
    propertyId,
    onSubmit,
    onCancel,
    isSubmitting,
}: TenantFormProps) {
    const isEditing = !!tenant

    // Fetch rooms for selection
    const { data: roomsData, isLoading: roomsLoading } = useRooms({
        property_id: propertyId,
    })
    const rooms = roomsData?.data?.rooms || []

    // Filter rooms: show all vacant rooms PLUS the current room of the tenant
    const availableRooms = rooms.filter(
        (room) => room.status === 'vacant' || (tenant && room.id === tenant.room_id)
    )

    const form = useForm<TenantFormInput>({
        resolver: zodResolver(tenantFormSchema),
        defaultValues: {
            full_name: tenant?.full_name || '',
            phone: tenant?.phone || '',
            email: tenant?.email || '',
            id_card: tenant?.id_card || '',
            room_id: tenant?.room_id || undefined,
            // Date input expects YYYY-MM-DD
            move_in_date: tenant?.move_in_date
                ? new Date(tenant.move_in_date)
                : new Date(),
            is_active: tenant?.is_active ?? true,
        },
    })

    const handleSubmit = (data: TenantFormInput) => {
        if (isEditing) {
            // Logic to handle update specific fields if needed, but schema handles widely
            const updateData: UpdateTenantInput = {
                full_name: data.full_name,
                phone: data.phone || null,
                email: data.email || null,
                id_card: data.id_card || null,
                room_id: data.room_id || null, // Allow null to unassign
                move_in_date: data.move_in_date?.toISOString(),
                is_active: data.is_active,
            }
            onSubmit(updateData)
        } else {
            onSubmit(data)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
                        <User className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-zinc-900">
                            {isEditing ? 'Sửa thông tin khách' : 'Thêm khách thuê'}
                        </h2>
                        <p className="text-sm text-zinc-500">
                            {isEditing
                                ? 'Cập nhật thông tin cá nhân và phòng'
                                : 'Nhập thông tin khách thuê mới'}
                        </p>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    {/* Full Name */}
                    <FormField
                        control={form.control}
                        name="full_name"
                        render={({ field }) => (
                            <FormItem className="sm:col-span-2">
                                <FormLabel>Họ và tên *</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input className="pl-9" placeholder="Nguyễn Văn A" {...field} />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Phone */}
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Số điện thoại</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input className="pl-9" placeholder="0909..." {...field} value={field.value || ''} />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Email */}
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input className="pl-9" placeholder="example@gmail.com" {...field} value={field.value || ''} />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* ID Card */}
                    <FormField
                        control={form.control}
                        name="id_card"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>CCCD / CMND</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <FileText className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input className="pl-9" placeholder="079..." {...field} value={field.value || ''} />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Room Selection */}
                    <FormField
                        control={form.control}
                        name="room_id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Chọn phòng</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value || undefined}
                                    value={field.value || undefined}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <div className="flex items-center gap-2">
                                                <Home className="h-4 w-4 text-muted-foreground" />
                                                <SelectValue placeholder="Chọn phòng (hoặc để trống)" />
                                            </div>
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="unassigned">-- Không xếp phòng --</SelectItem>
                                        {availableRooms.map((room) => (
                                            <SelectItem key={room.id} value={room.id}>
                                                {room.name} - {room.base_rent.toLocaleString('vi-VN')}đ
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {tenant?.room_id && !availableRooms.some(r => r.id === tenant.room_id) && (
                                    <FormDescription className="text-amber-600">
                                        Phòng hiện tại không khả dụng hoặc đã có người khác? (Kiểm tra dữ liệu)
                                    </FormDescription>
                                )}
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Move In Date */}
                    <FormField
                        control={form.control}
                        name="move_in_date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ngày vào ở</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            className="pl-9"
                                            type="date"
                                            {...field}
                                            value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                                            onChange={(e) => field.onChange(e.target.valueAsDate)}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Status (Only for edit) */}
                    {isEditing && (
                        <FormField
                            control={form.control}
                            name="is_active"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Trạng thái</FormLabel>
                                    <Select
                                        onValueChange={(val) => field.onChange(val === 'true')}
                                        defaultValue={field.value ? 'true' : 'false'}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="true">Đang thuê</SelectItem>
                                            <SelectItem value="false">Đã rời đi</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                </div>

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
                        {isEditing ? 'Lưu thay đổi' : 'Thêm khách'}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
