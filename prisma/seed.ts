import { PrismaClient, Role, PricingType, BookingStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding 3A Services database...');

  // ──────────────────────────────────────────
  // SERVICES
  // ──────────────────────────────────────────
  const services = await Promise.all([
    prisma.service.upsert({
      where: { slug: 'cleaning' },
      update: {},
      create: {
        name: 'Cleaning',
        slug: 'cleaning',
        icon: 'Sparkles',
        description: 'Professional home and office cleaning services',
        sortOrder: 1,
      },
    }),
    prisma.service.upsert({
      where: { slug: 'electrician' },
      update: {},
      create: {
        name: 'Electrician',
        slug: 'electrician',
        icon: 'Zap',
        description: 'Certified electrical installation and repairs',
        sortOrder: 2,
      },
    }),
    prisma.service.upsert({
      where: { slug: 'plumbing' },
      update: {},
      create: {
        name: 'Plumbing',
        slug: 'plumbing',
        icon: 'Droplets',
        description: 'Expert plumbing solutions for your home',
        sortOrder: 3,
      },
    }),
    prisma.service.upsert({
      where: { slug: 'cctv-installation' },
      update: {},
      create: {
        name: 'CCTV Installation',
        slug: 'cctv-installation',
        icon: 'Camera',
        description: 'Security camera installation and monitoring setup',
        sortOrder: 4,
      },
    }),
    prisma.service.upsert({
      where: { slug: 'nanny' },
      update: {},
      create: {
        name: 'Nanny',
        slug: 'nanny',
        icon: 'Baby',
        description: 'Trusted childcare professionals for your family',
        sortOrder: 5,
      },
    }),
    prisma.service.upsert({
      where: { slug: 'elderly-care' },
      update: {},
      create: {
        name: 'Elderly Care',
        slug: 'elderly-care',
        icon: 'Heart',
        description: 'Compassionate care for elderly family members',
        sortOrder: 6,
      },
    }),
  ]);

  console.log(`✅ Created ${services.length} services`);

  // ──────────────────────────────────────────
  // ADMIN USER
  // ──────────────────────────────────────────
  const adminHash = await bcrypt.hash('Admin@S3MU2024', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@servis360.mu' },
    update: {},
    create: {
      name: 'Servis360 Admin',
      email: 'admin@servis360.mu',
      passwordHash: adminHash,
      role: Role.ADMIN,
    },
  });
  console.log(`✅ Admin user: ${admin.email}`);

  // ──────────────────────────────────────────
  // SAMPLE CUSTOMERS
  // ──────────────────────────────────────────
  const customerHash = await bcrypt.hash('Customer@123', 12);
  const customers = await Promise.all([
    prisma.user.upsert({
      where: { email: 'jean.paul@example.mu' },
      update: {},
      create: {
        name: 'Jean-Paul Dupont',
        email: 'jean.paul@example.mu',
        passwordHash: customerHash,
        role: Role.CUSTOMER,
        avatarUrl: 'https://ui-avatars.com/api/?name=Jean+Paul&background=0F172A&color=FACC15',
      },
    }),
    prisma.user.upsert({
      where: { email: 'priya.nair@example.mu' },
      update: {},
      create: {
        name: 'Priya Nair',
        email: 'priya.nair@example.mu',
        passwordHash: customerHash,
        role: Role.CUSTOMER,
        avatarUrl: 'https://ui-avatars.com/api/?name=Priya+Nair&background=0F172A&color=FACC15',
      },
    }),
    prisma.user.upsert({
      where: { email: 'marc.wong@example.mu' },
      update: {},
      create: {
        name: 'Marc Wong',
        email: 'marc.wong@example.mu',
        passwordHash: customerHash,
        role: Role.CUSTOMER,
        avatarUrl: 'https://ui-avatars.com/api/?name=Marc+Wong&background=0F172A&color=FACC15',
      },
    }),
  ]);
  console.log(`✅ Created ${customers.length} customers`);

  // ──────────────────────────────────────────
  // SAMPLE WORKERS
  // ──────────────────────────────────────────
  const workerHash = await bcrypt.hash('Worker@123', 12);

  const workerData = [
    {
      email: 'amina.rashid@worker.mu',
      name: 'Amina Rashid',
      bio: 'Professional cleaner with 5 years of experience in residential and commercial spaces. Eco-friendly products specialist.',
      experience: 5,
      location: 'Port Louis, Mauritius',
      rating: 4.9,
      reviews: 47,
      services: [{ slug: 'cleaning', price: 350, type: PricingType.FIXED }],
    },
    {
      email: 'ravi.sharma@worker.mu',
      name: 'Ravi Sharma',
      bio: 'Certified electrician with 8 years of experience. Specialized in residential wiring and solar installations.',
      experience: 8,
      location: 'Curepipe, Mauritius',
      rating: 4.8,
      reviews: 63,
      services: [{ slug: 'electrician', price: 500, type: PricingType.HOURLY }],
    },
    {
      email: 'sarah.mootoosamy@worker.mu',
      name: 'Sarah Mootoosamy',
      bio: 'Licensed plumber with expertise in pipe repairs, bathroom installations, and water heater servicing.',
      experience: 6,
      location: 'Quatre Bornes, Mauritius',
      rating: 4.7,
      reviews: 38,
      services: [{ slug: 'plumbing', price: 450, type: PricingType.HOURLY }],
    },
    {
      email: 'kevin.lee@worker.mu',
      name: 'Kevin Lee',
      bio: 'CCTV installation expert with experience in residential and commercial security systems across Mauritius.',
      experience: 4,
      location: 'Rose Hill, Mauritius',
      rating: 4.9,
      reviews: 29,
      services: [{ slug: 'cctv-installation', price: 2500, type: PricingType.FIXED }],
    },
    {
      email: 'marie.claire@worker.mu',
      name: 'Marie-Claire Labelle',
      bio: 'Experienced nanny with a background in early childhood education. Bilingual (French/English). CPR certified.',
      experience: 7,
      location: 'Beau Bassin, Mauritius',
      rating: 5.0,
      reviews: 52,
      services: [{ slug: 'nanny', price: 400, type: PricingType.FIXED }],
    },
    {
      email: 'devika.patel@worker.mu',
      name: 'Devika Patel',
      bio: 'Compassionate caregiver specializing in elderly assistance, companionship, and medical appointment support.',
      experience: 10,
      location: 'Vacoas, Mauritius',
      rating: 4.8,
      reviews: 71,
      services: [{ slug: 'elderly-care', price: 450, type: PricingType.FIXED }],
    },
    {
      email: 'ali.hassan@worker.mu',
      name: 'Ali Hassan',
      bio: 'Multi-skilled professional offering cleaning and plumbing services. Known for fast response times.',
      experience: 3,
      location: 'Port Louis, Mauritius',
      rating: 4.6,
      reviews: 22,
      services: [
        { slug: 'cleaning', price: 300, type: PricingType.FIXED },
        { slug: 'plumbing', price: 400, type: PricingType.HOURLY },
      ],
    },
  ];

  for (const w of workerData) {
    const user = await prisma.user.upsert({
      where: { email: w.email },
      update: {},
      create: {
        name: w.name,
        email: w.email,
        passwordHash: workerHash,
        role: Role.WORKER,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(w.name)}&background=1E293B&color=FACC15&size=200`,
      },
    });

    const profile = await prisma.workerProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        bio: w.bio,
        experienceYears: w.experience,
        location: w.location,
        isVerified: true,
        isApproved: true,
        ratingAvg: w.rating,
        totalReviews: w.reviews,
        responseTime: 'Usually within 1 hour',
        isFeatured: w.rating >= 4.8,
      },
    });

    for (const svc of w.services) {
      const service = services.find((s) => s.slug === svc.slug);
      if (service) {
        await prisma.workerService.upsert({
          where: { workerId_serviceId: { workerId: profile.id, serviceId: service.id } },
          update: {},
          create: {
            workerId: profile.id,
            serviceId: service.id,
            price: svc.price,
            pricingType: svc.type,
          },
        });
      }
    }
  }

  console.log(`✅ Created ${workerData.length} workers with profiles`);

  // ──────────────────────────────────────────
  // SAMPLE BOOKINGS & REVIEWS
  // ──────────────────────────────────────────
  const customer = customers[0];
  const workerUser = await prisma.user.findUnique({ where: { email: 'amina.rashid@worker.mu' } });
  const cleaningService = services.find((s) => s.slug === 'cleaning');

  if (customer && workerUser && cleaningService) {
    const booking = await prisma.booking.upsert({
      where: { id: '00000000-0000-0000-0000-000000000001' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000001',
        customerId: customer.id,
        workerId: workerUser.id,
        serviceId: cleaningService.id,
        date: new Date('2024-03-15'),
        timeSlot: '09:00 - 11:00',
        address: '12 Rue de la Paix, Port Louis',
        notes: 'Please bring eco-friendly products',
        status: BookingStatus.COMPLETED,
        totalPrice: 350,
        platformFee: 35,
        workerEarning: 315,
        isPaid: true,
        completedAt: new Date('2024-03-15'),
      },
    });

    await prisma.review.upsert({
      where: { bookingId: booking.id },
      update: {},
      create: {
        bookingId: booking.id,
        customerId: customer.id,
        workerId: workerUser.id,
        rating: 5,
        comment:
          'Amina did an excellent job! The house was spotless and she was very professional. Highly recommend!',
      },
    });
  }

  console.log('✅ Sample bookings and reviews created');
  console.log('\n🎉 Seeding complete!\n');
  console.log('📋 Login credentials:');
  console.log('   Admin:    admin@servis360.mu      / Admin@S3MU2024');
  console.log('   Customer: jean.paul@example.mu   / Customer@123');
  console.log('   Worker:   amina.rashid@worker.mu / Worker@123');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
