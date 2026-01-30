export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    full_name: string | null
                    avatar_url: string | null
                    phone_number: string | null
                    role: string  // 'landlord' | 'staff'
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    full_name?: string | null
                    avatar_url?: string | null
                    phone_number?: string | null
                    role?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    full_name?: string | null
                    avatar_url?: string | null
                    phone_number?: string | null
                    role?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            properties: {
                Row: {
                    id: string
                    user_id: string | null
                    name: string
                    address: string | null
                    logo_url: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    name: string
                    address?: string | null
                    logo_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string | null
                    name?: string
                    address?: string | null
                    logo_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            rooms: {
                Row: {
                    id: string
                    property_id: string | null
                    name: string
                    floor: number | null
                    area: number | null
                    base_rent: number
                    status: string // 'vacant' | 'occupied'
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    property_id?: string | null
                    name: string
                    floor?: number | null
                    area?: number | null
                    base_rent: number
                    status?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    property_id?: string | null
                    name?: string
                    floor?: number | null
                    area?: number | null
                    base_rent?: number
                    status?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            tenants: {
                Row: {
                    id: string
                    room_id: string | null
                    full_name: string
                    phone: string | null
                    email: string | null
                    id_card: string | null
                    id_card_image_url: string | null
                    move_in_date: string | null
                    move_out_date: string | null
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    room_id?: string | null
                    full_name: string
                    phone?: string | null
                    email?: string | null
                    id_card?: string | null
                    id_card_image_url?: string | null
                    move_in_date?: string | null
                    move_out_date?: string | null
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    room_id?: string | null
                    full_name?: string
                    phone?: string | null
                    email?: string | null
                    id_card?: string | null
                    id_card_image_url?: string | null
                    move_in_date?: string | null
                    move_out_date?: string | null
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            price_settings: {
                Row: {
                    id: string
                    property_id: string | null
                    electricity_price: number
                    water_price: number
                    service_fee: number | null
                    wifi_fee: number | null
                    garbage_fee: number | null
                    effective_from: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    property_id?: string | null
                    electricity_price: number
                    water_price: number
                    service_fee?: number | null
                    wifi_fee?: number | null
                    garbage_fee?: number | null
                    effective_from: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    property_id?: string | null
                    electricity_price?: number
                    water_price?: number
                    service_fee?: number | null
                    wifi_fee?: number | null
                    garbage_fee?: number | null
                    effective_from?: string
                    created_at?: string
                }
            }
            utility_readings: {
                Row: {
                    id: string
                    room_id: string | null
                    month: number
                    year: number
                    electricity_start: number
                    electricity_end: number
                    electricity_used: number | null // generated
                    water_start: number
                    water_end: number
                    water_used: number | null // generated
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    room_id?: string | null
                    month: number
                    year: number
                    electricity_start: number
                    electricity_end: number
                    // used is generated
                    water_start: number
                    water_end: number
                    // used is generated
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    room_id?: string | null
                    month?: number
                    year?: number
                    electricity_start?: number
                    electricity_end?: number
                    water_start?: number
                    water_end?: number
                    created_at?: string
                    updated_at?: string
                }
            }
            bills: {
                Row: {
                    id: string
                    room_id: string | null
                    tenant_id: string | null
                    utility_reading_id: string | null
                    month: number
                    year: number
                    room_rent: number
                    electricity_amount: number
                    water_amount: number
                    service_fee: number | null
                    other_fee: number | null
                    other_fee_note: string | null
                    total_amount: number
                    status: string // 'pending' | 'paid'
                    paid_at: string | null
                    bill_image_url: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    room_id?: string | null
                    tenant_id?: string | null
                    utility_reading_id?: string | null
                    month: number
                    year: number
                    room_rent: number
                    electricity_amount: number
                    water_amount: number
                    service_fee?: number | null
                    other_fee?: number | null
                    other_fee_note?: string | null
                    total_amount: number
                    status?: string
                    paid_at?: string | null
                    bill_image_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    room_id?: string | null
                    tenant_id?: string | null
                    utility_reading_id?: string | null
                    month?: number
                    year?: number
                    room_rent?: number
                    electricity_amount?: number
                    water_amount?: number
                    service_fee?: number | null
                    other_fee?: number | null
                    other_fee_note?: string | null
                    total_amount?: number
                    status?: string
                    paid_at?: string | null
                    bill_image_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}

// ============================================
// Convenient Type Aliases
// ============================================

// Enum types for type safety
export type RoomStatus = 'vacant' | 'occupied'
export type BillStatus = 'pending' | 'paid'
export type UserRole = 'landlord' | 'staff'

// Row types (for reading data)
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Property = Database['public']['Tables']['properties']['Row']
export type Room = Database['public']['Tables']['rooms']['Row']
export type Tenant = Database['public']['Tables']['tenants']['Row']
export type PriceSetting = Database['public']['Tables']['price_settings']['Row']
export type UtilityReading = Database['public']['Tables']['utility_readings']['Row']
export type Bill = Database['public']['Tables']['bills']['Row']

// Insert types (for creating data)
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type PropertyInsert = Database['public']['Tables']['properties']['Insert']
export type RoomInsert = Database['public']['Tables']['rooms']['Insert']
export type TenantInsert = Database['public']['Tables']['tenants']['Insert']
export type PriceSettingInsert = Database['public']['Tables']['price_settings']['Insert']
export type UtilityReadingInsert = Database['public']['Tables']['utility_readings']['Insert']
export type BillInsert = Database['public']['Tables']['bills']['Insert']

// Update types (for modifying data)
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type PropertyUpdate = Database['public']['Tables']['properties']['Update']
export type RoomUpdate = Database['public']['Tables']['rooms']['Update']
export type TenantUpdate = Database['public']['Tables']['tenants']['Update']
export type PriceSettingUpdate = Database['public']['Tables']['price_settings']['Update']
export type UtilityReadingUpdate = Database['public']['Tables']['utility_readings']['Update']
export type BillUpdate = Database['public']['Tables']['bills']['Update']

// Extended types with relations
export interface RoomWithTenant extends Room {
    tenant?: Tenant | null
}

export interface RoomWithDetails extends Room {
    property?: Property
    tenant?: Tenant | null
    latest_reading?: UtilityReading | null
}

export interface PropertyWithRooms extends Property {
    rooms?: Room[]
}
