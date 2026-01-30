'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServer } from '@/lib/supabase/server'
import { z } from 'zod'

const authSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
})

export async function login(formData: FormData) {
    const supabase = await createServer()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function signup(formData: FormData) {
    const supabase = await createServer()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                avatar_url: '',
            },
        },
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}
