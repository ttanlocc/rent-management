import { redirect } from 'next/navigation'
import { createServer } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'


export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createServer()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    return (
        <div className="flex min-h-screen bg-zinc-50">
            {/* Desktop Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex flex-1 flex-col">
                {/* Header */}
                <Header />

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 pb-20 lg:p-6 lg:pb-6">
                    {children}
                </main>

                {/* Mobile Bottom Navigation */}
                <BottomNav />
            </div>
        </div>
    )
}
