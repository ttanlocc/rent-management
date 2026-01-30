/**
 * Formatting utilities for RentManager
 * Vietnamese locale formatting for currency, dates, and numbers
 */

/**
 * Format a number as Vietnamese currency (VND)
 * @example formatCurrency(3000000) => "3.000.000 đ"
 * @example formatCurrency(3000000, { showSymbol: false }) => "3.000.000"
 */
export function formatCurrency(
    amount: number | null | undefined,
    options: { showSymbol?: boolean } = {}
): string {
    const { showSymbol = true } = options

    if (amount === null || amount === undefined) {
        return showSymbol ? '0 đ' : '0'
    }

    const formatted = new Intl.NumberFormat('vi-VN').format(amount)
    return showSymbol ? `${formatted} đ` : formatted
}

/**
 * Format a number with thousand separators
 * @example formatNumber(1234567) => "1.234.567"
 */
export function formatNumber(value: number | null | undefined): string {
    if (value === null || value === undefined) return '0'
    return new Intl.NumberFormat('vi-VN').format(value)
}

/**
 * Format a date string or Date object to Vietnamese format
 * @example formatDate('2026-01-30') => "30/01/2026"
 * @example formatDate(new Date(), { includeTime: true }) => "30/01/2026 14:30"
 */
export function formatDate(
    date: string | Date | null | undefined,
    options: { includeTime?: boolean } = {}
): string {
    const { includeTime = false } = options

    if (!date) return ''

    const dateObj = typeof date === 'string' ? new Date(date) : date

    if (isNaN(dateObj.getTime())) return ''

    const formatOptions: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }

    if (includeTime) {
        formatOptions.hour = '2-digit'
        formatOptions.minute = '2-digit'
    }

    return dateObj.toLocaleDateString('vi-VN', formatOptions)
}

/**
 * Format month/year for display
 * @example formatMonthYear(1, 2026) => "Tháng 1/2026"
 */
export function formatMonthYear(month: number, year: number): string {
    return `Tháng ${month}/${year}`
}

/**
 * Format area in square meters
 * @example formatArea(25.5) => "25,5 m²"
 */
export function formatArea(area: number | null | undefined): string {
    if (area === null || area === undefined) return ''
    return `${area.toLocaleString('vi-VN')} m²`
}

/**
 * Format electricity usage
 * @example formatElectricityUsage(150) => "150 kWh"
 */
export function formatElectricityUsage(kwh: number | null | undefined): string {
    if (kwh === null || kwh === undefined) return '0 kWh'
    return `${formatNumber(kwh)} kWh`
}

/**
 * Format water usage
 * @example formatWaterUsage(10) => "10 m³"
 */
export function formatWaterUsage(cubic: number | null | undefined): string {
    if (cubic === null || cubic === undefined) return '0 m³'
    return `${formatNumber(cubic)} m³`
}

/**
 * Format phone number for display (Vietnamese format)
 * @example formatPhone('0912345678') => "091 234 5678"
 */
export function formatPhone(phone: string | null | undefined): string {
    if (!phone) return ''

    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '')

    // Format as Vietnamese mobile: 0xx xxx xxxx
    if (digits.length === 10) {
        return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
    }

    // Return as-is if format doesn't match
    return phone
}

/**
 * Get relative time description
 * @example getRelativeTime(new Date()) => "vừa xong"
 */
export function getRelativeTime(date: string | Date): string {
    const now = new Date()
    const then = typeof date === 'string' ? new Date(date) : date
    const diffMs = now.getTime() - then.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'vừa xong'
    if (diffMins < 60) return `${diffMins} phút trước`
    if (diffHours < 24) return `${diffHours} giờ trước`
    if (diffDays < 7) return `${diffDays} ngày trước`

    return formatDate(then)
}
