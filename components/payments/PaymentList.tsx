'use client'

import { PaymentCard } from './PaymentCard'
import { PaymentEmptyState } from './PaymentEmptyState'
import { Skeleton } from '@/components/ui/skeleton'

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

interface PaymentListProps {
    payments: Payment[]
    isLoading: boolean
    onAddPayment: () => void
    onEditPayment: (payment: Payment) => void
    onDeletePayment: (payment: Payment) => void
}

export function PaymentList({
    payments,
    isLoading,
    onAddPayment,
    onEditPayment,
    onDeletePayment,
}: PaymentListProps) {
    // Loading state: Grid of 4 skeleton cards
    if (isLoading) {
        return (
            <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-40 w-full" />
                ))}
            </div>
        )
    }

    // Empty state
    if (payments.length === 0) {
        return <PaymentEmptyState onAddPayment={onAddPayment} />
    }

    // List of payment cards
    return (
        <div className="space-y-3">
            {payments.map((payment) => (
                <PaymentCard
                    key={payment.id}
                    payment={payment}
                    onEdit={onEditPayment}
                    onDelete={onDeletePayment}
                />
            ))}
        </div>
    )
}
