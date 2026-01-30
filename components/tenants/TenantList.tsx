'use client'

import { TenantCard } from './TenantCard'
import { TenantEmptyState } from './TenantEmptyState'
import { Skeleton } from '@/components/ui/skeleton'

// Simplified types for now
interface Tenant {
    id: string
    [key: string]: any
}

interface TenantListProps {
    tenants: Tenant[]
    isLoading: boolean
    onAddTenant: () => void
    onEditTenant: (tenant: Tenant) => void
    onDeleteTenant: (tenant: Tenant) => void
}

export function TenantList({
    tenants,
    isLoading,
    onAddTenant,
    onEditTenant,
    onDeleteTenant,
}: TenantListProps) {
    if (isLoading) {
        return (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="rounded-xl border bg-card p-4 shadow-sm">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-[150px]" />
                                <Skeleton className="h-4 w-[100px]" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (tenants.length === 0) {
        return <TenantEmptyState onAddTenant={onAddTenant} />
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tenants.map((tenant) => (
                <TenantCard
                    key={tenant.id}
                    tenant={tenant}
                    onEdit={onEditTenant}
                    onDelete={onDeleteTenant}
                />
            ))}
        </div>
    )
}
