import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { UserPlus, Users } from 'lucide-react'

interface TenantEmptyStateProps {
    onAddTenant: () => void
}

export function TenantEmptyState({ onAddTenant }: TenantEmptyStateProps) {
    return (
        <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                <div className="mb-4 rounded-full bg-zinc-100 p-3">
                    <Users className="h-6 w-6 text-zinc-400" />
                </div>
                <h3 className="mb-1 text-lg font-semibold text-zinc-900">
                    Chưa có người thuê nào
                </h3>
                <p className="mb-4 max-w-sm text-sm text-zinc-500">
                    Thêm người thuê đầu tiên để quản lý thông tin, hợp đồng và hóa đơn.
                </p>
                <Button onClick={onAddTenant}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Thêm người thuê
                </Button>
            </CardContent>
        </Card>
    )
}
