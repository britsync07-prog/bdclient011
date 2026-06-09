const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const adminPassword = 'admin123';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      role: 'ADMIN',
      balance: 999999,
      referralCode: 'SYSTEM_ADMIN'
    }
  });

  console.log('Admin user seeded successfully:', admin.username);

  // Seed Default Site Settings
  const defaultSettings = [
    { key: 'about_us', value: 'Welcome to PBBET, the premier destination for live casino and slots.' },
    { key: 'social_facebook', value: 'https://facebook.com/pbbet' },
    { key: 'social_twitter', value: 'https://twitter.com/pbbet' },
    { key: 'social_instagram', value: 'https://instagram.com/pbbet' },
    { key: 'contact_email', value: 'support@pbbet.com' }
  ];

  for (const setting of defaultSettings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting
    });
  }
  console.log('Site settings seeded.');

  // Seed Default Banner
  const bannersCount = await prisma.banner.count();
  if (bannersCount === 0) {
    await prisma.banner.create({
      data: {
        title: 'Welcome to PBBET!',
        imageUrl: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?q=80&w=2070&auto=format&fit=crop',
        linkUrl: '/games',
        isActive: true,
        order: 1
      }
    });
    console.log('Default banner seeded.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
