'use client'

import { useState } from 'react'
import { usePayments, useCreatePayment, useUpdatePayment, useDeletePayment } from '@/hooks/usePayments'
import { useProperties } from '@/hooks/useProperties'
import { useTenants } from '@/hooks/useTenants'
import { PaymentList } from '@/components/payments/PaymentList'
import { PaymentForm } from '@/components/payments/PaymentForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Plus, AlertTriangle } from 'lucide-react'
import { PAYMENT_STATUSES } from '@/lib/validations/payment'

type DialogMode = 'closed' | 'create' | 'edit'

export default function PaymentsPage() {
    const [dialogMode, setDialogMode] = useState<DialogMode>('closed')
    const [selectedPayment, setSelectedPayment] = useState<any | null>(null)
    const [statusFilter, setStatusFilter] = useState<string>('')
    const [tenantFilter, setTenantFilter] = useState<string>('')
    const [overdueOnly, setOverdueOnly] = useState<boolean>(false)

    // Fetch data
    const { data: propertiesData, isLoading: propertiesLoading } = useProperties()
    const properties = propertiesData?.data?.properties || []
    const defaultProperty = properties[0]

    // Fetch tenants for form dropdown and filter
    const { data: tenantsData } = useTenants({})
    const tenants = tenantsData?.data?.tenants || []

    // Fetch payments with filters
    const { data: paymentsData, isLoading: paymentsLoading } = usePayments({
        payment_status: statusFilter || undefined,
        tenant_id: tenantFilter || undefined,
        overdue_only: overdueOnly ? 'true' : undefined,
    })
    const payments = paymentsData?.data?.payments || []

    // Mutations
    const createPayment = useCreatePayment()
    const updatePayment = useUpdatePayment()
    const deletePayment = useDeletePayment()

    // Handlers
    const handleOpenCreate = () => {
        setSelectedPayment(null)
        setDialogMode('create')
    }

    const handleOpenEdit = (payment: any) => {
        setSelectedPayment(payment)
        setDialogMode('edit')
    }

    const handleCloseDialog = () => {
        setDialogMode('closed')
        setSelectedPayment(null)
    }

    const handleSubmit = (formData: FormData) => {
        if (dialogMode === 'create') {
            createPayment.mutate(formData, {
                onSuccess: () => handleCloseDialog(),
            })
        } else if (dialogMode === 'edit' && selectedPayment) {
            // For edit mode, extract JSON data from formData
            const dataStr = formData.get('data') as string
            const parsedData = JSON.parse(dataStr)
            updatePayment.mutate(
                { id: selectedPayment.id, data: parsedData },
                { onSuccess: () => handleCloseDialog() }
            )
        }
    }

    const handleDelete = (payment: any) => {
        if (window.confirm('Bạn có chắc muốn xóa thanh toán này?')) {
            deletePayment.mutate(payment.id)
        }
    }

    const isLoading = propertiesLoading || paymentsLoading
    const hasNoProperty = !propertiesLoading && properties.length === 0

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">Quản lý thanh toán</h1>
                    <p className="text-sm text-zinc-500 mt-1">
                        {payments.length > 0
                            ? `${payments.length} thanh toán`
                            : 'Theo dõi thanh toán từ khách thuê'}
                    </p>
                </div>

                <Button onClick={handleOpenCreate} disabled={hasNoProperty || tenants.length === 0}>
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm thanh toán
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
                                Cần có ít nhất một nhà trọ và khách thuê để thêm thanh toán.
                            </p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                            <a href="/dashboard/settings">Tạo nhà trọ</a>
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* No Tenants Warning */}
            {!hasNoProperty && tenants.length === 0 && (
                <Card className="border-amber-200 bg-amber-50">
                    <CardContent className="flex items-center gap-4 py-4">
                        <div className="rounded-full bg-amber-100 p-2">
                            <AlertTriangle className="h-5 w-5 text-amber-600" />
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-amber-800">
                                Chưa có khách thuê nào
                            </p>
                            <p className="text-sm text-amber-600">
                                Cần có ít nhất một khách thuê để thêm thanh toán.
                            </p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                            <a href="/dashboard/tenants">Thêm khách thuê</a>
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Filter Bar */}
            {!hasNoProperty && tenants.length > 0 && (
                <div className="flex flex-wrap gap-3">
                    {/* Status Filter */}
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Tất cả trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">Tất cả trạng thái</SelectItem>
                            {PAYMENT_STATUSES.map((status) => (
                                <SelectItem key={status.value} value={status.value}>
                                    {status.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Tenant Filter */}
                    <Select value={tenantFilter} onValueChange={setTenantFilter}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Tất cả khách thuê" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">Tất cả khách thuê</SelectItem>
                            {tenants.map((tenant) => (
                                <SelectItem key={tenant.id} value={tenant.id}>
                                    {tenant.full_name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Overdue Only Toggle */}
                    <Button
                        variant={overdueOnly ? 'default' : 'outline'}
                        onClick={() => setOverdueOnly(!overdueOnly)}
                    >
                        {overdueOnly ? 'Hiển thị tất cả' : 'Chỉ hiện quá hạn'}
                    </Button>
                </div>
            )}

            {/* Payment List */}
            {!hasNoProperty && tenants.length > 0 && (
                <PaymentList
                    payments={payments}
                    isLoading={isLoading}
                    onAddPayment={handleOpenCreate}
                    onEditPayment={handleOpenEdit}
                    onDeletePayment={handleDelete}
                />
            )}

            {/* Create/Edit Modal */}
            {dialogMode !== 'closed' && tenants.length > 0 && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-all">
                    <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <CardContent className="pt-6">
                            <PaymentForm
                                payment={selectedPayment}
                                tenants={tenants}
                                onSubmit={handleSubmit}
                                onCancel={handleCloseDialog}
                                isSubmitting={createPayment.isPending || updatePayment.isPending}
                            />
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
