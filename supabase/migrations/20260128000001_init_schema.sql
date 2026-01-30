-- Enable Extensions
create extension if not exists "uuid-ossp";

-- 0. Bảng profiles (Public User Info)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255),
    avatar_url TEXT,
    phone_number VARCHAR(20),
    role VARCHAR(20) DEFAULT 'landlord',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Enable RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING ( true );

CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING ( auth.uid() = id );

-- 1. Bảng nhà trọ
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Bảng phòng trọ
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    floor INTEGER DEFAULT 1,
    area DECIMAL(10,2), -- diện tích m²
    base_rent DECIMAL(15,2) NOT NULL, -- giá thuê cơ bản
    status VARCHAR(20) DEFAULT 'vacant', -- 'occupied', 'vacant'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Bảng người thuê
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    id_card VARCHAR(20), -- CMND/CCCD
    id_card_image_url TEXT,
    move_in_date DATE,
    move_out_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Bảng cấu hình đơn giá
CREATE TABLE price_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    electricity_price DECIMAL(10,2) NOT NULL, -- đ/kWh
    water_price DECIMAL(10,2) NOT NULL, -- đ/m³
    service_fee DECIMAL(15,2) DEFAULT 0, -- phí dịch vụ cố định
    wifi_fee DECIMAL(15,2) DEFAULT 0,
    garbage_fee DECIMAL(15,2) DEFAULT 0,
    effective_from DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Bảng ghi số điện nước hàng tháng
CREATE TABLE utility_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    month INTEGER NOT NULL, -- 1-12
    year INTEGER NOT NULL,
    
    -- Số điện
    electricity_start DECIMAL(10,2) NOT NULL,
    electricity_end DECIMAL(10,2) NOT NULL,
    electricity_used DECIMAL(10,2) GENERATED ALWAYS AS (electricity_end - electricity_start) STORED,
    
    -- Số nước
    water_start DECIMAL(10,2) NOT NULL,
    water_end DECIMAL(10,2) NOT NULL,
    water_used DECIMAL(10,2) GENERATED ALWAYS AS (water_end - water_start) STORED,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(room_id, month, year)
);

-- 6. Bảng hóa đơn (bills)
CREATE TABLE bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    utility_reading_id UUID REFERENCES utility_readings(id),
    
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    
    -- Chi tiết tiền
    room_rent DECIMAL(15,2) NOT NULL,
    electricity_amount DECIMAL(15,2) NOT NULL,
    water_amount DECIMAL(15,2) NOT NULL,
    service_fee DECIMAL(15,2) DEFAULT 0,
    other_fee DECIMAL(15,2) DEFAULT 0,
    other_fee_note TEXT,
    total_amount DECIMAL(15,2) NOT NULL,
    
    -- Trạng thái
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid'
    paid_at TIMESTAMPTZ,
    
    -- Ảnh bill đã xuất
    bill_image_url TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(room_id, month, year)
);

-- 7. Row Level Security (RLS) policies 

-- Enable RLS cho tất cả tables
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE utility_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;

-- Policy: User chỉ thấy data của mình
CREATE POLICY "Users can view own properties" ON properties
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own properties" ON properties
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own properties" ON properties
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own properties" ON properties
    FOR DELETE USING (auth.uid() = user_id);

-- Rooms policies
CREATE POLICY "Users can view own rooms" ON rooms
    FOR ALL USING (
        property_id IN (SELECT id FROM properties WHERE user_id = auth.uid())
    );

-- Tenants policies
CREATE POLICY "Users can view own tenants" ON tenants
    FOR ALL USING (
        room_id IN (
            SELECT r.id FROM rooms r
            JOIN properties p ON r.property_id = p.id
            WHERE p.user_id = auth.uid()
        )
    );

-- Price settings policies
CREATE POLICY "Users can view own price_settings" ON price_settings
    FOR ALL USING (
        property_id IN (SELECT id FROM properties WHERE user_id = auth.uid())
    );

-- Utility reading policies
CREATE POLICY "Users can view own utility_readings" ON utility_readings
    FOR ALL USING (
        room_id IN (
            SELECT r.id FROM rooms r
            JOIN properties p ON r.property_id = p.id
            WHERE p.user_id = auth.uid()
        )
    );

-- Bills policies
CREATE POLICY "Users can view own bills" ON bills
    FOR ALL USING (
        room_id IN (
            SELECT r.id FROM rooms r
            JOIN properties p ON r.property_id = p.id
            WHERE p.user_id = auth.uid()
        )
    );

-- 8. Indexes

-- Performance indexes
CREATE INDEX idx_properties_user_id ON properties(user_id);

CREATE INDEX idx_rooms_property_id ON rooms(property_id);
CREATE INDEX idx_rooms_status ON rooms(status);

CREATE INDEX idx_tenants_room_id ON tenants(room_id);
CREATE INDEX idx_tenants_is_active ON tenants(is_active);

CREATE INDEX idx_utility_readings_room_month_year 
    ON utility_readings(room_id, month, year);

CREATE INDEX idx_bills_room_month_year 
    ON bills(room_id, month, year);
CREATE INDEX idx_bills_status ON bills(status);
CREATE INDEX idx_bills_tenant_id ON bills(tenant_id);

CREATE INDEX idx_price_settings_property_effective 
    ON price_settings(property_id, effective_from DESC);
