'use client'

import { useState } from 'react'
import { useTenants, useCreateTenant, useUpdateTenant, useDeleteTenant } from '@/hooks/useTenants'
import { useProperties } from '@/hooks/useProperties'
import { TenantFormInput, UpdateTenantInput } from '@/lib/validations/tenant'
import { TenantList } from '@/components/tenants/TenantList'
import { TenantForm } from '@/components/tenants/TenantForm'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Search, AlertTriangle } from 'lucide-react'

type DialogMode = 'closed' | 'create' | 'edit'

export default function TenantsPage() {
    const [dialogMode, setDialogMode] = useState<DialogMode>('closed')
    const [selectedTenant, setSelectedTenant] = useState<any | null>(null)
    const [searchQuery, setSearchQuery] = useState('')

    // Fetch data
    // We need property ID mainly for the form to filter rooms, but tenants are fetched globally (filtered by RLS)
    // However, for consistency, we might enforce property context later.
    const { data: propertiesData, isLoading: propertiesLoading } = useProperties()
    const properties = propertiesData?.data?.properties || []
    const defaultProperty = properties[0]

    const { data: tenantsData, isLoading: tenantsLoading } = useTenants({
        search: searchQuery || undefined,
        // Optional: filter by property if needed, but current API and hooks are global or RLS scoped
    })
    const tenants = tenantsData?.data?.tenants || []

    // Mutations
    const createTenant = useCreateTenant()
    const updateTenant = useUpdateTenant()
    const deleteTenant = useDeleteTenant()

    // Handlers
    const handleOpenCreate = () => {
        setSelectedTenant(null)
        setDialogMode('create')
    }

    const handleOpenEdit = (tenant: any) => {
        setSelectedTenant(tenant)
        setDialogMode('edit')
    }

    const handleCloseDialog = () => {
        setDialogMode('closed')
        setSelectedTenant(null)
    }

    const handleSubmit = (data: TenantFormInput | UpdateTenantInput) => {
        if (dialogMode === 'create') {
            createTenant.mutate(data as TenantFormInput, {
                onSuccess: () => handleCloseDialog(),
            })
        } else if (dialogMode === 'edit' && selectedTenant) {
            updateTenant.mutate(
                { id: selectedTenant.id, data: data as UpdateTenantInput },
                { onSuccess: () => handleCloseDialog() }
            )
        }
    }

    const handleDelete = (tenant: any) => {
        if (window.confirm(`Bạn có chắc muốn xóa khách "${tenant.full_name}"?`)) {
            deleteTenant.mutate(tenant.id)
        }
    }

    const isLoading = propertiesLoading || tenantsLoading
    const hasNoProperty = !propertiesLoading && properties.length === 0

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">Quản lý khách thuê</h1>
                    <p className="text-sm text-zinc-500 mt-1">
                        {tenants.length > 0
                            ? `${tenants.length} khách thuê`
                            : 'Danh sách khách thuê và hợp đồng'}
                    </p>
                </div>

                <Button onClick={handleOpenCreate} disabled={hasNoProperty}>
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm khách
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
                                Cần có ít nhất một nhà trọ và phòng trống để thêm khách.
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
                        placeholder="Tìm theo tên, số điện thoại..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            )}

            {/* Tenant List */}
            {!hasNoProperty && (
                <TenantList
                    tenants={tenants}
                    isLoading={isLoading}
                    onAddTenant={handleOpenCreate}
                    onEditTenant={handleOpenEdit}
                    onDeleteTenant={handleDelete}
                />
            )}

            {/* Create/Edit Modal */}
            {dialogMode !== 'closed' && defaultProperty && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-all">
                    <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <CardContent className="pt-6">
                            <TenantForm
                                tenant={selectedTenant}
                                propertyId={defaultProperty.id}
                                onSubmit={handleSubmit}
                                onCancel={handleCloseDialog}
                                isSubmitting={createTenant.isPending || updateTenant.isPending}
                            />
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
