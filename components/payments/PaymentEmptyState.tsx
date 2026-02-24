'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Receipt, Plus } from 'lucide-react'

interface PaymentEmptyStateProps {
    onAddPayment: () => void
}

export function PaymentEmptyState({ onAddPayment }: PaymentEmptyStateProps) {
    return (
        <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                <div className="mb-4 rounded-full bg-zinc-100 p-3">
                    <Receipt className="h-6 w-6 text-zinc-400" />
                </div>
                <h3 className="mb-1 text-lg font-semibold text-zinc-900">
                    Chưa có thanh toán nào
                </h3>
                <p className="mb-4 max-w-sm text-sm text-zinc-500">
                    Thêm thanh toán đầu tiên để quản lý và theo dõi thu chi từ khách thuê.
                </p>
                <Button onClick={onAddPayment}>
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm thanh toán
                </Button>
            </CardContent>
        </Card>
    )
}
