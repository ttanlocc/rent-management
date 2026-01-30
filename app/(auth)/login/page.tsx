'use client'

import { useActionState } from 'react'
import { login } from '../actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from 'next/link'
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const initialState = {
    error: '',
}

export default function LoginPage() {
    // @ts-ignore - useActionState types in React 19 might need adjustment or useFormState shim
    const [state, formAction, isPending] = useActionState(async (prevState: any, formData: FormData) => {
        const result = await login(formData)
        if (result?.error) {
            toast.error(result.error)
            return { error: result.error }
        }
        return { error: '' }
    }, initialState)

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Đăng nhập</CardTitle>
                <CardDescription>Nhập email và mật khẩu để truy cập.</CardDescription>
            </CardHeader>
            <form action={formAction}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" placeholder="name@example.com" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Mật khẩu</Label>
                        <Input id="password" name="password" type="password" required />
                    </div>
                    {state?.error && <p className="text-sm text-red-500">{state.error}</p>}
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Đăng nhập
                    </Button>
                    <div className="text-center text-sm">
                        Chưa có tài khoản?{" "}
                        <Link href="/signup" className="underline hover:text-primary">
                            Đăng ký
                        </Link>
                    </div>
                </CardFooter>
            </form>
        </Card>
    )
}
