'use client'

import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    User,
    Phone,
    Mail,
    Home,
    Calendar,
    MoreHorizontal,
    Edit,
    Trash,
    LogOut
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDate } from '@/lib/utils/formatters'

// To handle the type properly, we might want to import it from useTenants or a central types file
// but for simplicity in this component file, I'll inline the expected prop type
interface TenantCardProps {
    tenant: any // Replace with proper type later
    onEdit: (tenant: any) => void
    onDelete: (tenant: any) => void
}

export function TenantCard({ tenant, onEdit, onDelete }: TenantCardProps) {
    const isActive = tenant.is_active

    return (
        <Card className="overflow-hidden transition-all hover:shadow-md">
            <CardContent className="p-0">
                <div className="flex items-start justify-between p-4 pb-2">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                            <User className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-zinc-900">{tenant.full_name}</h3>
                            <div className="flex items-center gap-2 text-xs text-zinc-500">
                                {isActive ? (
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-2 py-0 h-5">
                                        Đang thuê
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="bg-zinc-100 text-zinc-500 border-zinc-200 px-2 py-0 h-5">
                                        Đã rời đi
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => onEdit(tenant)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Sửa thông tin
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                onClick={() => onDelete(tenant)}
                            >
                                <Trash className="mr-2 h-4 w-4" />
                                Xóa người thuê
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="px-4 pb-4 space-y-2">
                    {/* Contact Info */}
                    <div className="grid gap-1">
                        {tenant.phone && (
                            <div className="flex items-center gap-2 text-sm text-zinc-600">
                                <Phone className="h-4 w-4 text-zinc-400" />
                                <span>{tenant.phone}</span>
                            </div>
                        )}
                        {tenant.email && (
                            <div className="flex items-center gap-2 text-sm text-zinc-600">
                                <Mail className="h-4 w-4 text-zinc-400" />
                                <span className="truncate max-w-[200px]">{tenant.email}</span>
                            </div>
                        )}
                    </div>

                    <div className="h-px bg-zinc-100 my-2" />

                    {/* Room & Date Info */}
                    <div className="grid gap-2">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-zinc-600">
                                <Home className="h-4 w-4 text-zinc-400" />
                                <span>Phòng:</span>
                            </div>
                            <span className="font-medium">
                                {tenant.room ? tenant.room.name : 'Chưa xếp phòng'}
                            </span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-zinc-600">
                                <Calendar className="h-4 w-4 text-zinc-400" />
                                <span>Ngày vào:</span>
                            </div>
                            <span>
                                {tenant.move_in_date
                                    ? formatDate(tenant.move_in_date)
                                    : '--/--/----'}
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
