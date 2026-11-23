-- =========================================================================
-- ROASTBOOK POS & ACCOUNTING - SUPABASE POSTGRESQL SCHEMA
-- Sistem Pembukuan & Manajemen Stok UMKM Roasted Bean Trading
-- =========================================================================

-- Aktifkan ekstensi UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABEL VARIAN ROASTED BEAN (MASTER DATA)
CREATE TABLE IF NOT EXISTS coffee_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    roast_profile VARCHAR(100) NOT NULL,
    origin VARCHAR(255) NOT NULL,
    default_price_per_kg NUMERIC(12, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABEL KARTU MUTASI STOK ROASTED BEAN (METODE WEIGHTED AVERAGE)
CREATE TABLE IF NOT EXISTS stock_mutations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    evidence_no VARCHAR(100) NOT NULL,
    variant VARCHAR(255) NOT NULL,
    roast_profile VARCHAR(100),
    type VARCHAR(10) NOT NULL CHECK (type IN ('IN', 'OUT')),
    -- Mutasi Masuk (Kulak)
    in_kg NUMERIC(10, 2) DEFAULT 0,
    buy_price_per_kg NUMERIC(12, 2) DEFAULT 0,
    in_total NUMERIC(15, 2) DEFAULT 0,
    -- Mutasi Keluar (Penjualan)
    out_kg NUMERIC(10, 2) DEFAULT 0,
    selling_price_per_kg NUMERIC(12, 2) DEFAULT 0,
    revenue_total NUMERIC(15, 2) DEFAULT 0,
    out_cost_per_kg NUMERIC(12, 2) DEFAULT 0,
    out_total_cost NUMERIC(15, 2) DEFAULT 0,
    -- Saldo & Weighted Average
    balance_kg NUMERIC(10, 2) NOT NULL DEFAULT 0,
    balance_value NUMERIC(15, 2) NOT NULL DEFAULT 0,
    avg_hpp_per_kg NUMERIC(12, 2) NOT NULL DEFAULT 0,
    -- Relasi & Metadata
    customer_or_vendor VARCHAR(255),
    notes TEXT,
    synced_to_cash BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABEL TENAGA KERJA LANGSUNG (TKL PACKING & QC)
CREATE TABLE IF NOT EXISTS direct_labors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role VARCHAR(255) NOT NULL,
    headcount INT NOT NULL DEFAULT 1,
    monthly_wage NUMERIC(12, 2) NOT NULL DEFAULT 0,
    allowance_overtime NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total NUMERIC(15, 2) GENERATED ALWAYS AS (headcount * (monthly_wage + allowance_overtime)) STORED,
    period_month VARCHAR(7) NOT NULL DEFAULT '2026-11',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABEL BIAYA OVERHEAD KEMASAN & GUDANG
CREATE TABLE IF NOT EXISTS overhead_costs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Tetap', 'Variabel', 'Semi-Variabel')),
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    portion_percent NUMERIC(5, 2) NOT NULL DEFAULT 100.00,
    description TEXT,
    period_month VARCHAR(7) NOT NULL DEFAULT '2026-11',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TABEL BEBAN OPERASIONAL KANTOR
CREATE TABLE IF NOT EXISTS office_expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    date DATE NOT NULL,
    period_month VARCHAR(7) NOT NULL DEFAULT '2026-11',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. TABEL BUKU KAS UMUM (ARUS KAS DEBIT/KREDIT)
CREATE TABLE IF NOT EXISTS cash_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    evidence_no VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL CHECK (category IN (
        'Saldo Awal',
        'Penjualan Roasted Bean',
        'Pembelian Roasted Bean',
        'Tenaga Packing & QC',
        'Overhead Kemasan & Gudang',
        'Pemasaran & Sampel',
        'Gaji & Umum Kantor',
        'Lain-lain'
    )),
    type VARCHAR(10) NOT NULL CHECK (type IN ('IN', 'OUT')),
    amount NUMERIC(15, 2) NOT NULL,
    running_balance NUMERIC(15, 2) DEFAULT 0,
    source VARCHAR(50) DEFAULT 'manual',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- INDEKS PERFORMA
CREATE INDEX IF NOT EXISTS idx_stock_mutations_date ON stock_mutations(date);
CREATE INDEX IF NOT EXISTS idx_stock_mutations_evidence ON stock_mutations(evidence_no);
CREATE INDEX IF NOT EXISTS idx_cash_transactions_date ON cash_transactions(date);
CREATE INDEX IF NOT EXISTS idx_cash_transactions_category ON cash_transactions(category);

-- =========================================================================
-- SEED DATA AWAL BULAN SIMULASI (NOVEMBER 2026)
-- =========================================================================

-- Saldo Kas Awal & Transaksi Kas
INSERT INTO cash_transactions (date, evidence_no, description, category, type, amount, running_balance, source)
VALUES
('2026-11-01', 'BKM-01', 'Saldo Awal Kas & Bank Operasional November 2026', 'Saldo Awal', 'IN', 65000000, 65000000, 'manual'),
('2026-11-03', 'BEL-01', 'Pembelian 300 Kg Arabika Gayo Medium Roast - CV Kopi Dataran Tinggi', 'Pembelian Roasted Bean', 'OUT', 42000000, 23000000, 'stock_sync'),
('2026-11-07', 'BEL-02', 'Pembelian 250 Kg Robusta Temanggung - Koperasi Petani Temanggung', 'Pembelian Roasted Bean', 'OUT', 23750000, -750000, 'stock_sync'),
('2026-11-10', 'JUAL-01', 'Penerimaan Penjualan B2B 350 Kg - Kopi Sejiwa Group', 'Penjualan Roasted Bean', 'IN', 68250000, 67500000, 'stock_sync'),
('2026-11-14', 'BEL-03', 'Pembelian 200 Kg Toraja Sapan Specialty - Mitra Roastery Toraja', 'Pembelian Roasted Bean', 'OUT', 31000000, 36500000, 'stock_sync'),
('2026-11-18', 'JUAL-02', 'Penerimaan Penjualan Horeca 180 Kg - Grand Mulia Hotel & Resort', 'Penjualan Roasted Bean', 'IN', 37800000, 74300000, 'stock_sync'),
('2026-11-20', 'BKK-01', 'Pembayaran Gaji Admin Kantor & Langganan Software', 'Gaji & Umum Kantor', 'OUT', 3500000, 70800000, 'manual'),
('2026-11-21', 'JUAL-03', 'Penerimaan Penjualan Retail Online 120 Kg (Pouch 200g)', 'Penjualan Roasted Bean', 'IN', 28200000, 99000000, 'stock_sync'),
('2026-11-21', 'BKK-02', 'Biaya Pemasaran Digital, Meta Ads & Tester Sample Kafe', 'Pemasaran & Sampel', 'OUT', 4200000, 94800000, 'manual'),
('2026-11-22', 'BKK-03', 'Upah & Tunjangan Lembur Tenaga Kerja Langsung Packing & QC', 'Tenaga Packing & QC', 'OUT', 11400000, 83400000, 'tkl_sync'),
('2026-11-22', 'BKK-04', 'Total Biaya Overhead Kemasan, Sewa Toko, Listrik & Ekspedisi', 'Overhead Kemasan & Gudang', 'OUT', 15100000, 68300000, 'overhead_sync');

-- Kartu Stok (Weighted Average)
INSERT INTO stock_mutations (date, evidence_no, variant, roast_profile, type, in_kg, buy_price_per_kg, in_total, out_kg, selling_price_per_kg, revenue_total, out_cost_per_kg, out_total_cost, balance_kg, balance_value, avg_hpp_per_kg, customer_or_vendor, notes, synced_to_cash)
VALUES
('2026-11-01', 'OPN-01', 'Saldo Awal Persediaan Roasted Bean', 'Campuran Profil Sangrai Gudang', 'IN', 150, 135000, 20250000, 0, 0, 0, 0, 0, 150, 20250000, 135000, 'Gudang Utama (Stok Awal Bulan)', 'Stok fisik opname awal bulan November', true),
('2026-11-03', 'BEL-01', 'Arabika Gayo Full Wash', 'Medium Roast (Filter/Espresso)', 'IN', 300, 140000, 42000000, 0, 0, 0, 0, 0, 450, 62250000, 138333.33, 'CV Kopi Dataran Tinggi Gayo', 'Batch #AG-881, karung grainpro 50kg', true),
('2026-11-07', 'BEL-02', 'Robusta Temanggung Fine Natural', 'Dark-Medium Espresso Roast', 'IN', 250, 95000, 23750000, 0, 0, 0, 0, 0, 700, 86000000, 122857.14, 'Koperasi Petani Temanggung Makmur', 'Profil espresso bold body, kadar air 11%', true),
('2026-11-10', 'JUAL-01', 'House Blend & Single Origin Kafe Mix', 'Medium Roast B2B', 'OUT', 0, 0, 0, 350, 195000, 68250000, 122857.14, 43000000, 350, 43000000, 122857.14, 'Kopi Sejiwa Group (Jaringan 5 Cabang)', 'Pengiriman PO bulanan 5 cabang kafe', true),
('2026-11-14', 'BEL-03', 'Toraja Sapan Specialty', 'Light-Medium Roast (Filter)', 'IN', 200, 155000, 31000000, 0, 0, 0, 0, 0, 550, 74000000, 134545.45, 'Mitra Roastery Toraja Highland', 'Grade 1 cupping score 85+, lot pilihan', true),
('2026-11-18', 'JUAL-02', 'Toraja Sapan & Arabika Gayo', 'Filter & Espresso Resto', 'OUT', 0, 0, 0, 180, 210000, 37800000, 134545.45, 24218181.82, 370, 49781818.18, 134545.45, 'Grand Mulia Hotel & Resort (Horeca)', 'Kontrak pasokan coffee lounge & breakfast', true),
('2026-11-21', 'JUAL-03', 'Arabika Gayo & Toraja Pouch 200g', 'Retail Specialty Pouch', 'OUT', 0, 0, 0, 120, 235000, 28200000, 134545.45, 16145454.55, 250, 33636363.63, 134545.45, 'Penjualan Marketplace Online & Konsinyasi', 'Total 600 pouch @ 200g kemasan valve', true);

-- Tenaga Kerja Langsung (TKL)
INSERT INTO direct_labors (role, headcount, monthly_wage, allowance_overtime, period_month)
VALUES
('Staf Repacking, Heat-Sealing, Grinding & Labeling', 2, 3200000, 450000, '2026-11'),
('Staf Quality Control Cupping & Gudang', 1, 3800000, 300000, '2026-11');

-- Biaya Overhead Kemasan & Gudang
INSERT INTO overhead_costs (name, category, amount, portion_percent, description, period_month)
VALUES
('Kemasan Gusset / Flat Bottom One-Way Degassing Valve + Stiker Roast Date', 'Variabel', 3900000, 100.00, 'Pouch foil matte black valve food grade + label foil cetak', '2026-11'),
('Ongkos Kirim / Ekspedisi Kulak dari Roastery Mitra', 'Variabel', 2450000, 100.00, 'Kargo darat/udara dari Aceh, Temanggung & Toraja', '2026-11'),
('Sewa Toko & Ruang Penyimpanan Kedap Udara', 'Tetap', 4500000, 100.00, 'Sewa ruko operasional & ruang simpan terkontrol suhu', '2026-11'),
('Listrik Grinder Komersial, Impulse Sealer & AC Ruang Simpan', 'Semi-Variabel', 1850000, 100.00, 'Tarif listrik daya B2/3500VA untuk peralatan repacking', '2026-11'),
('Penyusutan Peralatan: Grinder, Band Sealer, Timbangan Digital', 'Tetap', 950000, 100.00, 'Amortisasi aset peralatan operasional masa pakai 3 tahun', '2026-11'),
('Alokasi Biji Kopi untuk Cupping QC, Kalibrasi & Tester Pelanggan (±1,5%)', 'Variabel', 1450000, 100.00, 'Sampel kalibrasi brew, sensori cupping & tester kafe prospek', '2026-11');
