'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    AlertCircle,
    Receipt,
    Edit,
    Trash2,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import { cn } from '@/lib/utils'

// Payment type from usePayments hook
interface Payment {
    id: string
    tenant_id: string
    payment_date: string
    amount: number
    payment_method: string
    payment_status: string
    receipt_url: string | null
    transaction_reference: string | null
    notes: string | null
    created_at: string
    updated_at: string
    tenant?: {
        id: string
        full_name: string
        room?: { id: string; name: string } | null
    } | null
}

interface PaymentCardProps {
    payment: Payment
    onEdit: (payment: Payment) => void
    onDelete: (payment: Payment) => void
}

export function PaymentCard({ payment, onEdit, onDelete }: PaymentCardProps) {
    // Overdue detection: not paid in full and past payment date
    const isOverdue = payment.payment_status !== 'paid_in_full' && new Date(payment.payment_date) < new Date()

    // Status badge mapping
    const getStatusBadge = () => {
        switch (payment.payment_status) {
            case 'paid_in_full':
                return <Badge variant="default">Đã thanh toán</Badge>
            case 'partial_payment':
                return <Badge variant="secondary">Thanh toán 1 phần</Badge>
            case 'late_fee_applied':
                return <Badge variant="outline">Phạt trễ hạn</Badge>
            default:
                return null
        }
    }

    // Payment method labels
    const getPaymentMethodLabel = () => {
        switch (payment.payment_method) {
            case 'cash':
                return 'Tiền mặt'
            case 'bank_transfer':
                return 'Chuyển khoản'
            case 'check':
                return 'Séc'
            default:
                return payment.payment_method
        }
    }

    return (
        <Card className={cn(
            'overflow-hidden transition-all hover:shadow-md',
            isOverdue && 'border-red-200 bg-red-50'
        )}>
            <CardContent className="p-4">
                {/* Top row: Amount + Status + Overdue badge */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-zinc-900">
                            {formatCurrency(payment.amount)}
                        </h3>
                        {getStatusBadge()}
                        {isOverdue && (
                            <Badge variant="destructive" className="gap-1">
                                <AlertCircle className="h-3 w-3" />
                                Quá hạn
                            </Badge>
                        )}
                    </div>
                    <div className="flex gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => onEdit(payment)}
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => onDelete(payment)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="h-px bg-zinc-200 my-2" />

                {/* Second row: Tenant + Date */}
                <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-medium text-zinc-900">
                        {payment.tenant?.full_name || 'Chưa có thông tin'}
                        {payment.tenant?.room && (
                            <span className="text-zinc-500 ml-1">
                                - {payment.tenant.room.name}
                            </span>
                        )}
                    </span>
                    <span className="text-zinc-600">
                        {formatDate(payment.payment_date)}
                    </span>
                </div>

                {/* Third row: Payment method + Receipt */}
                <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-zinc-600">
                        {getPaymentMethodLabel()}
                    </span>
                    {payment.receipt_url && (
                        <div className="flex items-center gap-1 text-green-600">
                            <Receipt className="h-3.5 w-3.5" />
                            <span className="text-xs">Có biên lai</span>
                        </div>
                    )}
                </div>

                {/* Transaction reference */}
                {payment.transaction_reference && (
                    <div className="text-xs text-zinc-500 mb-2">
                        Mã GD: {payment.transaction_reference}
                    </div>
                )}

                {/* Notes */}
                {payment.notes && (
                    <div className="text-xs text-zinc-600 mt-2 italic line-clamp-2">
                        {payment.notes}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
