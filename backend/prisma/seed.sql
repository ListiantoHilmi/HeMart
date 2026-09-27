-- SQL Seed Script for E-Commerce & Admin Suite Database (PostgreSQL)
-- Schema berdasarkan backend/prisma/schema.prisma
-- Masing-masing tabel berisi 10 data sampel.

-- 1. PERS IAPAN ENUM TYPES (Jika belum dibuat oleh Prisma)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Role') THEN
        CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'ADMIN');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PaymentType') THEN
        CREATE TYPE "PaymentType" AS ENUM ('IN_STORE', 'ONLINE');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PaymentStatus') THEN
        CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'FulfillmentStatus') THEN
        CREATE TYPE "FulfillmentStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED');
    END IF;
END $$;

-- 2. PEMBUATAN TABEL (DDL)
CREATE TABLE IF NOT EXISTS "users" (
    "id" VARCHAR(36) PRIMARY KEY,
    "supabaseUid" VARCHAR(255) UNIQUE,
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "categories" (
    "id" VARCHAR(36) PRIMARY KEY,
    "name" VARCHAR(255) UNIQUE NOT NULL,
    "slug" VARCHAR(255) UNIQUE NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "products" (
    "id" VARCHAR(36) PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) UNIQUE NOT NULL,
    "description" TEXT,
    "price" DECIMAL(12,2) NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "imageUrl" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT FALSE,
    "categoryId" VARCHAR(36) NOT NULL REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "payment_methods" (
    "id" VARCHAR(36) PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "code" VARCHAR(255) UNIQUE NOT NULL,
    "type" "PaymentType" NOT NULL DEFAULT 'ONLINE',
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "instructions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "orders" (
    "id" VARCHAR(36) PRIMARY KEY,
    "orderCode" VARCHAR(255) UNIQUE NOT NULL,
    "userId" VARCHAR(36) REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    "customerName" VARCHAR(255),
    "customerPhone" VARCHAR(255),
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "fulfillmentStatus" "FulfillmentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethodId" VARCHAR(36) NOT NULL REFERENCES "payment_methods"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    "notes" TEXT,
    "paymentProofUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "order_items" (
    "id" VARCHAR(36) PRIMARY KEY,
    "orderId" VARCHAR(36) NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "productId" VARCHAR(36) NOT NULL REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    "quantity" INTEGER NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL
);

-- 3. INPUT DATA SAMPEL (DML) - 10 DATA UNTUK SETIAP TABEL

-- TABEL 1: users (10 data)
INSERT INTO "users" ("id", "supabaseUid", "email", "name", "role", "createdAt", "updatedAt")
VALUES
('a1000000-0000-0000-0000-000000000001', 'sub_admin_01', 'admin@store.com', 'Executive Admin', 'ADMIN', NOW(), NOW()),
('a1000000-0000-0000-0000-000000000002', 'sub_admin_02', 'manager@store.com', 'Manager Toko', 'ADMIN', NOW(), NOW()),
('a1000000-0000-0000-0000-000000000003', 'sub_cust_01', 'budi@gmail.com', 'Budi Santoso', 'CUSTOMER', NOW(), NOW()),
('a1000000-0000-0000-0000-000000000004', 'sub_cust_02', 'siti@gmail.com', 'Siti Rahma', 'CUSTOMER', NOW(), NOW()),
('a1000000-0000-0000-0000-000000000005', 'sub_cust_03', 'dewi@gmail.com', 'Dewi Lestari', 'CUSTOMER', NOW(), NOW()),
('a1000000-0000-0000-0000-000000000006', 'sub_cust_04', 'andri@yahoo.com', 'Andri Wijaya', 'CUSTOMER', NOW(), NOW()),
('a1000000-0000-0000-0000-000000000007', 'sub_cust_05', 'rizky@hotmail.com', 'Rizky Pratama', 'CUSTOMER', NOW(), NOW()),
('a1000000-0000-0000-0000-000000000008', 'sub_cust_06', 'nana@outlook.com', 'Nana Marlina', 'CUSTOMER', NOW(), NOW()),
('a1000000-0000-0000-0000-000000000009', 'sub_cust_07', 'fajar@gmail.com', 'Fajar Nugraha', 'CUSTOMER', NOW(), NOW()),
('a1000000-0000-0000-0000-000000000010', 'sub_cust_08', 'linda@gmail.com', 'Linda Permata', 'CUSTOMER', NOW(), NOW())
ON CONFLICT ("id") DO UPDATE SET "name" = EXCLUDED."name";

-- TABEL 2: categories (10 data)
INSERT INTO "categories" ("id", "name", "slug", "description", "createdAt", "updatedAt")
VALUES
('b1000000-0000-0000-0000-000000000001', 'Electronics & Audio', 'electronics', 'Perangkat audio premium, smartwatch, dan gadget terkini', NOW(), NOW()),
('b1000000-0000-0000-0000-000000000002', 'Apparel & Lifestyle', 'fashion', 'Pakaian modern, aksesori elegan, dan produk gaya hidup', NOW(), NOW()),
('b1000000-0000-0000-0000-000000000003', 'Home & Living', 'home-living', 'Dekorasi minimalis, peralatan kerja ergonomis, dan kebutuhan rumah', NOW(), NOW()),
('b1000000-0000-0000-0000-000000000004', 'Computers & Accessories', 'computers', 'Laptop, aksesoris komputer, keyboard mekanikal, dan perlengkapan kerja', NOW(), NOW()),
('b1000000-0000-0000-0000-000000000005', 'Gaming & Consoles', 'gaming', 'Konsol gim, pengontrol, headset gaming, dan perlengkapan esport', NOW(), NOW()),
('b1000000-0000-0000-0000-000000000006', 'Cameras & Photography', 'cameras', 'Kamera mirrorless, lensa, tripod, dan aksesori fotografi', NOW(), NOW()),
('b1000000-0000-0000-0000-000000000007', 'Sports & Fitness', 'sports', 'Peralatan gym rumah, botol minum termal, dan perlengkapan olahraga', NOW(), NOW()),
('b1000000-0000-0000-0000-000000000008', 'Footwear & Shoes', 'footwear', 'Sepatu kasual, sepatu lari, dan alas kaki bergaya modern', NOW(), NOW()),
('b1000000-0000-0000-0000-000000000009', 'Stationery & Office', 'stationery', 'Buku catatan kustom, pena eksklusif, dan perlengkapan meja kerja', NOW(), NOW()),
('b1000000-0000-0000-0000-000000000010', 'Bags & Luggage', 'bags', 'Tas ransel laptop, tas selempang, dan koper perjalanan', NOW(), NOW())
ON CONFLICT ("id") DO UPDATE SET "name" = EXCLUDED."name";

-- TABEL 3: products (10 data)
INSERT INTO "products" ("id", "name", "slug", "description", "price", "stock", "imageUrl", "isDeleted", "categoryId", "createdAt", "updatedAt")
VALUES
('c1000000-0000-0000-0000-000000000001', 'Aura Wireless ANC Headphones', 'aura-wireless-headphones', 'Headphone nirkabel dengan Active Noise Cancelling dan daya tahan baterai 40 jam.', 249.99, 18, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop', FALSE, 'b1000000-0000-0000-0000-000000000001', NOW(), NOW()),
('c1000000-0000-0000-0000-000000000002', 'Pulse X Smartwatch Titanium', 'pulse-x-smartwatch', 'Smartwatch layar AMOLED dengan pemantau kesehatan dan GPS terintegrasi.', 199.50, 25, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop', FALSE, 'b1000000-0000-0000-0000-000000000001', NOW(), NOW()),
('c1000000-0000-0000-0000-000000000003', 'CyberLeather RFID Wallet', 'cyberleather-wallet', 'Dompet kulit asli Italia dengan proteksi RFID anti-scanning.', 49.00, 40, 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop', FALSE, 'b1000000-0000-0000-0000-000000000002', NOW(), NOW()),
('c1000000-0000-0000-0000-000000000004', 'Lumina Ceramic Desk Lamp', 'lumina-ceramic-desk-lamp', 'Lampu meja LED hangat dengan bantalan pengisi daya nirkabel Qi.', 89.90, 12, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop', FALSE, 'b1000000-0000-0000-0000-000000000003', NOW(), NOW()),
('c1000000-0000-0000-0000-000000000005', 'HydroSteel Vacuum Flask 1000ml', 'hydrosteel-flask-1000ml', 'Botol minum termal stainless steel menjaga suhu dingin hingga 24 jam.', 34.99, 30, 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop', FALSE, 'b1000000-0000-0000-0000-000000000007', NOW(), NOW()),
('c1000000-0000-0000-0000-000000000006', 'Vortex RGB Mechanical Keyboard', 'vortex-mechanical-keyboard', 'Keyboard mekanikal hot-swappable dengan switch kustom dan keycaps PBT.', 139.00, 8, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop', FALSE, 'b1000000-0000-0000-0000-000000000004', NOW(), NOW()),
('c1000000-0000-0000-0000-000000000007', 'ProGlide Ergonomic Wireless Mouse', 'proglide-wireless-mouse', 'Mouse nirkabel presisi tinggi dengan desain ergonomis pelindung pergelangan tangan.', 65.00, 15, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop', FALSE, 'b1000000-0000-0000-0000-000000000004', NOW(), NOW()),
('c1000000-0000-0000-0000-000000000008', 'Apex Pro Gaming Headset', 'apex-pro-gaming-headset', 'Headset gaming dengan suara surround 7.1 dan mikrofon peredam bising.', 119.99, 20, 'https://images.unsplash.com/photo-1599669454699-24889d6df33b?w=800&auto=format&fit=crop', FALSE, 'b1000000-0000-0000-0000-000000000005', NOW(), NOW()),
('c1000000-0000-0000-0000-000000000009', 'Urban Nomad Laptop Backpack', 'urban-nomad-backpack', 'Ransel laptop tahan air 15.6 inci dengan kompartemen rahasia anti-maling.', 79.50, 22, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop', FALSE, 'b1000000-0000-0000-0000-000000000010', NOW(), NOW()),
('c1000000-0000-0000-0000-000000000010', 'Minimalist Leather Sneakers', 'minimalist-leather-sneakers', 'Sepatu kets kulit sintetis kasual cocok untuk kegiatan harian.', 85.00, 14, 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop', FALSE, 'b1000000-0000-0000-0000-000000000008', NOW(), NOW())
ON CONFLICT ("id") DO UPDATE SET "name" = EXCLUDED."name";

-- TABEL 4: payment_methods (10 data)
INSERT INTO "payment_methods" ("id", "name", "code", "type", "isActive", "instructions", "createdAt", "updatedAt")
VALUES
('d1000000-0000-0000-0000-000000000001', 'Bayar di Kasir Toko', 'CASH_STORE', 'IN_STORE', TRUE, 'Tunjukkan resi digital di Kasir #1 atau #2 untuk melakukan pembayaran tunai.', NOW(), NOW()),
('d1000000-0000-0000-0000-000000000002', 'QRIS Instant Payment', 'QRIS_ONLINE', 'ONLINE', TRUE, 'Pindai kode QR menggunakan GoPay, OVO, ShopeePay, Dana, atau m-Banking.', NOW(), NOW()),
('d1000000-0000-0000-0000-000000000003', 'Transfer Bank BCA', 'BANK_BCA', 'ONLINE', TRUE, 'Transfer ke Rekening BCA 8820-9912-3841 a/n PT E-Commerce Indonesia.', NOW(), NOW()),
('d1000000-0000-0000-0000-000000000004', 'Transfer Bank Mandiri', 'BANK_MANDIRI', 'ONLINE', TRUE, 'Transfer ke Mandiri VA 89012-3841-992 a/n PT E-Commerce Indonesia.', NOW(), NOW()),
('d1000000-0000-0000-0000-000000000005', 'Transfer Bank BNI', 'BANK_BNI', 'ONLINE', TRUE, 'Transfer ke BNI Virtual Account 988-0012-3841-0000.', NOW(), NOW()),
('d1000000-0000-0000-0000-000000000006', 'Transfer Bank BRI', 'BANK_BRI', 'ONLINE', TRUE, 'Transfer ke BRI Virtual Account 10293-882-0129.', NOW(), NOW()),
('d1000000-0000-0000-0000-000000000007', 'GoPay E-Wallet', 'GOPAY_ONLINE', 'ONLINE', TRUE, 'Gunakan aplikasi Gojek untuk konfirmasi pembayaran GoPay.', NOW(), NOW()),
('d1000000-0000-0000-0000-000000000008', 'OVO E-Wallet', 'OVO_ONLINE', 'ONLINE', TRUE, 'Buka aplikasi OVO dan setujui tagihan push notification.', NOW(), NOW()),
('d1000000-0000-0000-0000-000000000009', 'ShopeePay Online', 'SHOPEEPAY', 'ONLINE', TRUE, 'Bayar langsung melalui aplikasi Shopee via ShopeePay.', NOW(), NOW()),
('d1000000-0000-0000-0000-000000000010', 'Kartu Kredit / Debit', 'CREDIT_CARD', 'ONLINE', TRUE, 'Masukkan nomor kartu Visa/Mastercard 16 digit dan kode OTP.', NOW(), NOW())
ON CONFLICT ("id") DO UPDATE SET "name" = EXCLUDED."name";

-- TABEL 5: orders (10 data)
INSERT INTO "orders" ("id", "orderCode", "userId", "customerName", "customerPhone", "totalAmount", "paymentStatus", "fulfillmentStatus", "paymentMethodId", "notes", "paymentProofUrl", "createdAt", "updatedAt")
VALUES
('e1000000-0000-0000-0000-000000000001', 'ORD-20260925-0001', 'a1000000-0000-0000-0000-000000000003', 'Budi Santoso', '081234567890', 249.99, 'PAID', 'COMPLETED', 'd1000000-0000-0000-0000-000000000002', 'Mohon dikemas dengan bubble wrap tebal', 'https://storage.supabase.co/proof/proof-0001.jpg', NOW(), NOW()),
('e1000000-0000-0000-0000-000000000002', 'ORD-20260925-0002', 'a1000000-0000-0000-0000-000000000004', 'Siti Rahma', '082198765432', 199.50, 'PAID', 'PROCESSING', 'd1000000-0000-0000-0000-000000000003', 'Kirim menggunakan kurir instan', 'https://storage.supabase.co/proof/proof-0002.jpg', NOW(), NOW()),
('e1000000-0000-0000-0000-000000000003', 'ORD-20260925-0003', 'a1000000-0000-0000-0000-000000000005', 'Dewi Lestari', '085611223344', 49.00, 'PENDING', 'PENDING', 'd1000000-0000-0000-0000-000000000001', 'Akan diambil langsung di toko jam 4 sore', NULL, NOW(), NOW()),
('e1000000-0000-0000-0000-000000000004', 'ORD-20260925-0004', 'a1000000-0000-0000-0000-000000000006', 'Andri Wijaya', '087855667788', 124.89, 'PAID', 'COMPLETED', 'd1000000-0000-0000-0000-000000000002', 'Terima kasih fast response', 'https://storage.supabase.co/proof/proof-0004.jpg', NOW(), NOW()),
('e1000000-0000-0000-0000-000000000005', 'ORD-20260925-0005', 'a1000000-0000-0000-0000-000000000007', 'Rizky Pratama', '089944332211', 139.00, 'PAID', 'PROCESSING', 'd1000000-0000-0000-0000-000000000004', NULL, 'https://storage.supabase.co/proof/proof-0005.jpg', NOW(), NOW()),
('e1000000-0000-0000-0000-000000000006', 'ORD-20260925-0006', 'a1000000-0000-0000-0000-000000000008', 'Nana Marlina', '081399887766', 65.00, 'FAILED', 'CANCELLED', 'd1000000-0000-0000-0000-000000000007', 'Batal beli karena ubah varian', NULL, NOW(), NOW()),
('e1000000-0000-0000-0000-000000000007', 'ORD-20260925-0007', 'a1000000-0000-0000-0000-000000000009', 'Fajar Nugraha', '082233445566', 119.99, 'PAID', 'COMPLETED', 'd1000000-0000-0000-0000-000000000002', 'Bagus barang sesuai pesanan', 'https://storage.supabase.co/proof/proof-0007.jpg', NOW(), NOW()),
('e1000000-0000-0000-0000-000000000008', 'ORD-20260925-0008', 'a1000000-0000-0000-0000-000000000010', 'Linda Permata', '085788990011', 79.50, 'PENDING', 'PENDING', 'd1000000-0000-0000-0000-000000000003', 'Menunggu transfer bank', NULL, NOW(), NOW()),
('e1000000-0000-0000-0000-000000000009', 'ORD-20260925-0009', NULL, 'Pelanggan Anonim 1', '081299990000', 85.00, 'PAID', 'COMPLETED', 'd1000000-0000-0000-0000-000000000001', 'Guest checkout langsung di toko', NULL, NOW(), NOW()),
('e1000000-0000-0000-0000-000000000010', 'ORD-20260925-0010', NULL, 'Pelanggan Anonim 2', '082188887777', 164.50, 'PAID', 'PROCESSING', 'd1000000-0000-0000-0000-000000000002', 'Tolong diprioritaskan', 'https://storage.supabase.co/proof/proof-0010.jpg', NOW(), NOW())
ON CONFLICT ("id") DO UPDATE SET "orderCode" = EXCLUDED."orderCode";

-- TABEL 6: order_items (10 data)
INSERT INTO "order_items" ("id", "orderId", "productId", "quantity", "price", "subtotal")
VALUES
('f1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 1, 249.99, 249.99),
('f1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000002', 1, 199.50, 199.50),
('f1000000-0000-0000-0000-000000000003', 'e1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000003', 1, 49.00, 49.00),
('f1000000-0000-0000-0000-000000000004', 'e1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000004', 1, 89.90, 89.90),
('f1000000-0000-0000-0000-000000000005', 'e1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000005', 1, 34.99, 34.99),
('f1000000-0000-0000-0000-000000000006', 'e1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000006', 1, 139.00, 139.00),
('f1000000-0000-0000-0000-000000000007', 'e1000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000007', 1, 65.00, 65.00),
('f1000000-0000-0000-0000-000000000008', 'e1000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000008', 1, 119.99, 119.99),
('f1000000-0000-0000-0000-000000000009', 'e1000000-0000-0000-0000-000000000008', 'c1000000-0000-0000-0000-000000000009', 1, 79.50, 79.50),
('f1000000-0000-0000-0000-000000000010', 'e1000000-0000-0000-0000-000000000010', 'c1000000-0000-0000-0000-000000000010', 1, 85.00, 85.00)
ON CONFLICT ("id") DO NOTHING;
