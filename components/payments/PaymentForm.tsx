'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { paymentFormSchema, PaymentFormInput, PAYMENT_METHODS, PAYMENT_STATUSES } from '@/lib/validations/payment'
import { buildPaymentFormData } from '@/hooks/usePayments'
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
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Receipt, Calendar, Banknote, Hash, FileUp, User, ExternalLink } from 'lucide-react'
import { useState } from 'react'

interface PaymentFormProps {
    payment?: any // For edit mode
    tenants: Array<{ id: string; full_name: string; room?: { name: string } | null }>
    onSubmit: (formData: FormData) => void
    onCancel?: () => void
    isSubmitting?: boolean
}

export function PaymentForm({
    payment,
    tenants,
    onSubmit,
    onCancel,
    isSubmitting,
}: PaymentFormProps) {
    const isEditing = !!payment
    const [selectedFileName, setSelectedFileName] = useState<string>('')

    const form = useForm<PaymentFormInput>({
        resolver: zodResolver(paymentFormSchema),
        defaultValues: {
            tenant_id: payment?.tenant_id || '',
            payment_date: payment?.payment_date
                ? new Date(payment.payment_date)
                : new Date(),
            amount: payment?.amount || 0,
            payment_method: payment?.payment_method || 'cash',
            payment_status: payment?.payment_status || 'paid_in_full',
            transaction_reference: payment?.transaction_reference || '',
            receipt_file: null,
            notes: payment?.notes || '',
        },
    })

    const handleSubmit = (data: PaymentFormInput) => {
        const { receipt_file, ...paymentData } = data
        const formData = buildPaymentFormData(
            {
                ...paymentData,
                payment_date: data.payment_date, // Date object -> handled by buildPaymentFormData
            },
            receipt_file || null
        )
        onSubmit(formData)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                        <Receipt className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-zinc-900">
                            {isEditing ? 'Sửa thanh toán' : 'Thêm thanh toán'}
                        </h2>
                        <p className="text-sm text-zinc-500">
                            {isEditing
                                ? 'Cập nhật thông tin thanh toán'
                                : 'Nhập thông tin thanh toán từ khách'}
                        </p>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    {/* Tenant Selection */}
                    <FormField
                        control={form.control}
                        name="tenant_id"
                        render={({ field }) => (
                            <FormItem className="sm:col-span-2">
                                <FormLabel>Khách thuê *</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    value={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-muted-foreground" />
                                                <SelectValue placeholder="Chọn khách thuê" />
                                            </div>
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {tenants.map((tenant) => (
                                            <SelectItem key={tenant.id} value={tenant.id}>
                                                {tenant.full_name}
                                                {tenant.room && ` - ${tenant.room.name}`}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Payment Date */}
                    <FormField
                        control={form.control}
                        name="payment_date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ngày thanh toán *</FormLabel>
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

                    {/* Amount */}
                    <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Số tiền *</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Banknote className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            className="pl-9"
                                            type="number"
                                            step="1000"
                                            placeholder="0"
                                            {...field}
                                            onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Payment Method */}
                    <FormField
                        control={form.control}
                        name="payment_method"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phương thức *</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    value={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn phương thức" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {PAYMENT_METHODS.map((method) => (
                                            <SelectItem key={method.value} value={method.value}>
                                                {method.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Payment Status */}
                    <FormField
                        control={form.control}
                        name="payment_status"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Trạng thái *</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    value={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn trạng thái" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {PAYMENT_STATUSES.map((status) => (
                                            <SelectItem key={status.value} value={status.value}>
                                                {status.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Transaction Reference */}
                    <FormField
                        control={form.control}
                        name="transaction_reference"
                        render={({ field }) => (
                            <FormItem className="sm:col-span-2">
                                <FormLabel>Mã giao dịch</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            className="pl-9"
                                            placeholder="Số giao dịch / mã chuyển khoản"
                                            {...field}
                                            value={field.value || ''}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Receipt Upload */}
                    <FormField
                        control={form.control}
                        name="receipt_file"
                        render={({ field: { value, onChange, ...fieldProps } }) => (
                            <FormItem className="sm:col-span-2">
                                <FormLabel>Biên lai</FormLabel>
                                <FormControl>
                                    <div className="space-y-2">
                                        <div className="relative">
                                            <FileUp className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                className="pl-9"
                                                type="file"
                                                accept="image/jpeg,image/png,image/webp,application/pdf"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0] || null
                                                    onChange(file)
                                                    setSelectedFileName(file?.name || '')
                                                }}
                                                {...fieldProps}
                                            />
                                        </div>
                                        {selectedFileName && (
                                            <p className="text-xs text-zinc-600">
                                                Đã chọn: {selectedFileName}
                                            </p>
                                        )}
                                        {isEditing && payment.receipt_url && !selectedFileName && (
                                            <div className="flex items-center gap-2">
                                                <a
                                                    href={payment.receipt_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                                                >
                                                    <ExternalLink className="h-3 w-3" />
                                                    Biên lai hiện tại
                                                </a>
                                                <span className="text-xs text-zinc-500">
                                                    (Chọn file mới để thay thế)
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </FormControl>
                                <FormDescription>
                                    Tối đa 5MB. Chấp nhận ảnh (JPEG, PNG, WebP) hoặc PDF.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Notes */}
                    <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                            <FormItem className="sm:col-span-2">
                                <FormLabel>Ghi chú</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Ghi chú thêm..."
                                        className="resize-none"
                                        rows={3}
                                        {...field}
                                        value={field.value || ''}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
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
                        {isEditing ? 'Lưu thay đổi' : 'Thêm thanh toán'}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
