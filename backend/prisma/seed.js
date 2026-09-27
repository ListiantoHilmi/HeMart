const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Create Users
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@store.com' },
    update: {},
    create: {
      email: 'admin@store.com',
      name: 'Executive Admin',
      role: 'ADMIN',
    },
  });

  const customerUser = await prisma.user.upsert({
    where: { email: 'customer@store.com' },
    update: {},
    create: {
      email: 'customer@store.com',
      name: 'Jane Customer',
      role: 'CUSTOMER',
    },
  });

  // 2. Create Categories
  const catElectronics = await prisma.category.upsert({
    where: { slug: 'electronics' },
    update: {},
    create: {
      name: 'Electronics & Audio',
      slug: 'electronics',
      description: 'Premium headphones, smartwatches, and gadgets',
    },
  });

  const catFashion = await prisma.category.upsert({
    where: { slug: 'fashion' },
    update: {},
    create: {
      name: 'Apparel & Lifestyle',
      slug: 'fashion',
      description: 'Luxury modern apparel and accessories',
    },
  });

  const catHome = await prisma.category.upsert({
    where: { slug: 'home-living' },
    update: {},
    create: {
      name: 'Home & Living',
      slug: 'home-living',
      description: 'Minimalist ergonomic decor and everyday essentials',
    },
  });

  // 3. Create Products
  const products = [
    {
      name: 'HeMart Wireless Noise-Canceling Headphones',
      slug: 'aura-wireless-headphones',
      description: 'Studio-grade acoustics with active noise cancellation and 40-hour battery life.',
      price: 3500000,
      stock: 18,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop',
      categoryId: catElectronics.id,
    },
    {
      name: 'Pulse X Minimalist Smartwatch',
      slug: 'pulse-x-smartwatch',
      description: 'AMOLED edge display with health telemetry, GPS, and titanium enclosure.',
      price: 2800000,
      stock: 25,
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop',
      categoryId: catElectronics.id,
    },
    {
      name: 'CyberLeather Minimalist Wallet',
      slug: 'cyberleather-wallet',
      description: 'RFID-blocking slim cardholder crafted from full-grain Italian leather.',
      price: 650000,
      stock: 40,
      imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop',
      categoryId: catFashion.id,
    },
    {
      name: 'Lumina Ceramic Desk Lamp',
      slug: 'lumina-ceramic-desk-lamp',
      description: 'Warm ambient LED light with wireless charging pad built into ceramic base.',
      price: 1250000,
      stock: 12,
      imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop',
      categoryId: catHome.id,
    },
    {
      name: 'HydroSteel Vacuum Flask 1000ml',
      slug: 'hydrosteel-flask-1000ml',
      description: 'Double-wall insulated flask keeping beverages cold for 24 hours.',
      price: 450000,
      stock: 30,
      imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop',
      categoryId: catHome.id,
    },
    {
      name: 'Vortex Mechanical Keyboard RGB',
      slug: 'vortex-mechanical-keyboard',
      description: 'Custom hot-swappable switches with gasket mount and PBT keycaps.',
      price: 1950000,
      stock: 8,
      imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop',
      categoryId: catElectronics.id,
    },
    {
      name: 'ProGlide Ergonomic Wireless Mouse',
      slug: 'proglide-wireless-mouse',
      description: 'Mouse nirkabel presisi tinggi dengan desain ergonomis pelindung pergelangan tangan.',
      price: 650000,
      stock: 15,
      imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop',
      categoryId: catElectronics.id,
    },
    {
      name: 'Apex Pro Gaming Headset',
      slug: 'apex-pro-gaming-headset',
      description: 'Headset gaming dengan suara surround 7.1 dan mikrofon peredam bising.',
      price: 1750000,
      stock: 20,
      imageUrl: 'https://images.unsplash.com/photo-1599669454699-24889d6df33b?w=800&auto=format&fit=crop',
      categoryId: catElectronics.id,
    },
    {
      name: 'Urban Nomad Laptop Backpack',
      slug: 'urban-nomad-backpack',
      description: 'Ransel laptop tahan air 15.6 inci dengan kompartemen rahasia anti-maling.',
      price: 890000,
      stock: 22,
      imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop',
      categoryId: catFashion.id,
    },
    {
      name: 'Minimalist Leather Sneakers',
      slug: 'minimalist-leather-sneakers',
      description: 'Sepatu kets kulit sintetis kasual cocok untuk kegiatan harian.',
      price: 950000,
      stock: 14,
      imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop',
      categoryId: catFashion.id,
    }
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        price: p.price,
        description: p.description,
      },
      create: p,
    });
  }

  // 4. Create Payment Methods
  const paymentMethods = [
    {
      name: 'Pay at Store Cashier',
      code: 'CASH_STORE',
      type: 'IN_STORE',
      isActive: true,
      instructions: 'Show your Digital Order Receipt at Cashier desk #1 or #2 to complete payment and pickup.',
    },
    {
      name: 'QRIS Instant Payment',
      code: 'QRIS_ONLINE',
      type: 'ONLINE',
      isActive: true,
      instructions: 'Scan the generated QR Code using GoPay, OVO, ShopeePay, or any mobile banking app.',
    },
    {
      name: 'Direct Bank Transfer',
      code: 'BANK_TRANSFER',
      type: 'ONLINE',
      isActive: true,
      instructions: 'Transfer to Virtual Account #8820-9912-3841 (Bank Central) and upload receipt screenshot.',
    },
  ];

  for (const pm of paymentMethods) {
    await prisma.paymentMethod.upsert({
      where: { code: pm.code },
      update: {},
      create: pm,
    });
  }

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
