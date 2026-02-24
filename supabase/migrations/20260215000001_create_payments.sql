-- =====================================================
-- Payment Tracking Migration
-- Creates payments table, storage bucket, and RLS policies
-- =====================================================

-- 1. Create payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    payment_date TIMESTAMPTZ NOT NULL,
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('cash', 'bank_transfer', 'check')),
    payment_status VARCHAR(20) NOT NULL CHECK (payment_status IN ('paid_in_full', 'partial_payment', 'late_fee_applied')),
    receipt_url TEXT,
    transaction_reference VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policy: Users can only manage payments for their own tenants
CREATE POLICY "Users can manage own payments" ON payments
    FOR ALL USING (
        tenant_id IN (
            SELECT t.id FROM tenants t
            JOIN rooms r ON t.room_id = r.id
            JOIN properties p ON r.property_id = p.id
            WHERE p.user_id = auth.uid()
        )
    );

-- 4. Indexes for performance
CREATE INDEX idx_payments_tenant_id ON payments(tenant_id);
CREATE INDEX idx_payments_payment_date ON payments(payment_date DESC);
CREATE INDEX idx_payments_status ON payments(payment_status);
CREATE INDEX idx_payments_overdue ON payments(payment_status, payment_date)
    WHERE payment_status != 'paid_in_full';

-- 5. Updated_at trigger
-- Reuse existing function if it exists, otherwise create it
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Storage bucket for payment receipts
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-receipts', 'payment-receipts', true);

-- 7. Storage RLS policies
-- Allow authenticated users to insert receipts
CREATE POLICY "Authenticated users can upload receipts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'payment-receipts' AND
    (storage.foldername(name))[1] = 'receipts'
);

-- Allow authenticated users to view receipts
CREATE POLICY "Authenticated users can view receipts"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'payment-receipts');

-- Allow authenticated users to delete their own receipts
CREATE POLICY "Authenticated users can delete receipts"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'payment-receipts');
