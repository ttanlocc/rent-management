/**
 * API Error Handling Utilities
 * Consistent error response format based on TRD Section 4.4
 */

import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

// Error codes as defined in TRD
export type ApiErrorCode =
    | 'VALIDATION_ERROR'
    | 'NOT_FOUND'
    | 'UNAUTHORIZED'
    | 'FORBIDDEN'
    | 'CONFLICT'
    | 'INTERNAL_ERROR'

export interface ApiErrorResponse {
    error: {
        code: ApiErrorCode
        message: string
        details?: Record<string, string[]>
    }
}

export interface ApiSuccessResponse<T> {
    data: T
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
    code: ApiErrorCode,
    message: string,
    details?: Record<string, string[]>,
    status?: number
): NextResponse<ApiErrorResponse> {
    const statusCode = status ?? getStatusFromCode(code)

    return NextResponse.json(
        {
            error: {
                code,
                message,
                ...(details && { details }),
            },
        },
        { status: statusCode }
    )
}

/**
 * Create a standardized success response
 */
export function createSuccessResponse<T>(
    data: T,
    status: number = 200
): NextResponse<ApiSuccessResponse<T>> {
    return NextResponse.json({ data }, { status })
}

/**
 * Map error code to HTTP status
 */
function getStatusFromCode(code: ApiErrorCode): number {
    const statusMap: Record<ApiErrorCode, number> = {
        VALIDATION_ERROR: 400,
        NOT_FOUND: 404,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        CONFLICT: 409,
        INTERNAL_ERROR: 500,
    }
    return statusMap[code]
}

/**
 * Handle Zod validation errors
 */
export function handleZodError(error: ZodError): NextResponse<ApiErrorResponse> {
    const details: Record<string, string[]> = {}

    // Zod 4.x uses 'issues' instead of 'errors'
    error.issues.forEach((issue) => {
        const path = issue.path.join('.') || 'root'
        if (!details[path]) {
            details[path] = []
        }
        details[path].push(issue.message)
    })

    return createErrorResponse(
        'VALIDATION_ERROR',
        'Dữ liệu không hợp lệ',
        details
    )
}

/**
 * Handle Supabase errors
 */
export function handleSupabaseError(error: {
    code?: string
    message?: string
    details?: string
}): NextResponse<ApiErrorResponse> {
    // Map common Supabase error codes
    if (error.code === '23505') {
        // Unique constraint violation
        return createErrorResponse(
            'CONFLICT',
            'Dữ liệu đã tồn tại trong hệ thống'
        )
    }

    if (error.code === '23503') {
        // Foreign key violation
        return createErrorResponse(
            'VALIDATION_ERROR',
            'Dữ liệu tham chiếu không tồn tại'
        )
    }

    if (error.code === 'PGRST116') {
        // No rows returned
        return createErrorResponse('NOT_FOUND', 'Không tìm thấy dữ liệu')
    }

    // Generic error
    console.error('Supabase error:', error)
    return createErrorResponse(
        'INTERNAL_ERROR',
        'Đã xảy ra lỗi. Vui lòng thử lại sau.'
    )
}

/**
 * Wrap an async handler with error handling
 */
export function withErrorHandler<T>(
    handler: () => Promise<NextResponse<T>>
): Promise<NextResponse<T | ApiErrorResponse>> {
    return handler().catch((error) => {
        if (error instanceof ZodError) {
            return handleZodError(error)
        }

        console.error('Unhandled error:', error)
        return createErrorResponse(
            'INTERNAL_ERROR',
            'Đã xảy ra lỗi không mong đợi'
        )
    })
}

// Common error responses (pre-built for convenience)
export const errors = {
    unauthorized: (message = 'Vui lòng đăng nhập để tiếp tục') =>
        createErrorResponse('UNAUTHORIZED', message),

    forbidden: (message = 'Bạn không có quyền thực hiện thao tác này') =>
        createErrorResponse('FORBIDDEN', message),

    notFound: (resource = 'Dữ liệu') =>
        createErrorResponse('NOT_FOUND', `${resource} không tồn tại`),

    validation: (message: string, details?: Record<string, string[]>) =>
        createErrorResponse('VALIDATION_ERROR', message, details),

    conflict: (message = 'Dữ liệu đã tồn tại') =>
        createErrorResponse('CONFLICT', message),

    internal: () =>
        createErrorResponse('INTERNAL_ERROR', 'Đã xảy ra lỗi. Vui lòng thử lại sau.'),
}
