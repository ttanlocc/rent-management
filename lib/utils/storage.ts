/**
 * Supabase Storage utility functions for payment receipts
 * Handles upload and deletion of receipt files
 */

import { createClient } from '@/lib/supabase/client'

/**
 * Upload a receipt file to Supabase Storage
 * @param file - The file to upload
 * @param paymentId - The payment ID to associate with the receipt
 * @returns The public URL of the uploaded file
 * @throws Error if upload fails
 */
export async function uploadReceipt(file: File, paymentId: string): Promise<string> {
    const supabase = createClient()

    // Generate unique filename with timestamp
    const fileExt = file.name.split('.').pop()
    const fileName = `${paymentId}_${Date.now()}.${fileExt}`
    const filePath = `receipts/${fileName}`

    // Upload file to storage
    const { data, error } = await supabase.storage
        .from('payment-receipts')
        .upload(filePath, file, {
            contentType: file.type,
            cacheControl: '3600',
            upsert: false,
        })

    if (error) {
        throw new Error(`Failed to upload receipt: ${error.message}`)
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
        .from('payment-receipts')
        .getPublicUrl(data.path)

    return publicUrlData.publicUrl
}

/**
 * Delete a receipt file from Supabase Storage
 * @param url - The full public URL of the file to delete
 * @throws Error if deletion fails
 */
export async function deleteReceipt(url: string): Promise<void> {
    const supabase = createClient()

    // Parse the storage path from the full URL
    // URL format: https://.../storage/v1/object/public/payment-receipts/receipts/filename.ext
    const urlParts = url.split('/receipts/')
    if (urlParts.length < 2) {
        throw new Error('Invalid receipt URL format')
    }

    const filePath = `receipts/${urlParts[1]}`

    // Delete file from storage
    const { error } = await supabase.storage
        .from('payment-receipts')
        .remove([filePath])

    if (error) {
        throw new Error(`Failed to delete receipt: ${error.message}`)
    }
}
