import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient, ServiceCategory } from "@prisma/client";

const prisma = new PrismaClient();

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@queensbeauty.salon";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "AdminPass123!";

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: "ADMIN",
      name: "Salon Admin",
      passwordHash,
    },
    create: {
      email: adminEmail,
      name: "Salon Admin",
      role: "ADMIN",
      passwordHash,
      phone: "+91 90000 00000",
    },
  });

  console.log("Admin ready:", admin.email);

  const servicesData = [
    {
      name: "Signature Haircut & Style",
      description:
        "Consultation, precision cut, and finish styling tailored to your face shape.",
      category: ServiceCategory.HAIR,
      durationMinutes: 60,
      price: 899,
    },
    {
      name: "Keratin Glow Treatment",
      description:
        "Smoothing treatment that restores shine and softens frizz for weeks.",
      category: ServiceCategory.HAIR,
      durationMinutes: 120,
      price: 3499,
    },
    {
      name: "Royal Facial Ritual",
      description:
        "Deep cleanse, massage, mask, and glow finish for radiant skin.",
      category: ServiceCategory.SKIN,
      durationMinutes: 75,
      price: 1899,
    },
    {
      name: "Gel Manicure",
      description: "Nail care, cuticle tidy, and long-wear gel polish.",
      category: ServiceCategory.NAILS,
      durationMinutes: 45,
      price: 799,
    },
    {
      name: "Aromatherapy Spa Massage",
      description:
        "Full-body massage with warm oils to melt tension and restore calm.",
      category: ServiceCategory.SPA,
      durationMinutes: 90,
      price: 2499,
    },
    {
      name: "Bridal Glow Package",
      description:
        "Hair, makeup trial prep, facial, and nails for your special day.",
      category: ServiceCategory.PACKAGE,
      durationMinutes: 180,
      price: 9999,
    },
  ];

  const services = [];
  for (const item of servicesData) {
    const slug = slugify(item.name);
    const service = await prisma.service.upsert({
      where: { slug },
      update: { ...item, isActive: true },
      create: { ...item, slug, isActive: true },
    });
    services.push(service);
  }

  console.log(`Services seeded: ${services.length}`);

  const now = new Date();
  const inThirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  await prisma.offer.deleteMany({});

  await prisma.offer.createMany({
    data: [
      {
        title: "Midweek Facial Escape",
        description: "Enjoy 20% off our Royal Facial Ritual Tuesday–Thursday.",
        discountPercent: 20,
        validFrom: now,
        validTo: inThirtyDays,
        isActive: true,
        serviceIds: [services[2]!.id],
      },
      {
        title: "Spa Serenity Duo",
        description: "Book a spa massage and save ₹500 on your visit.",
        discountAmount: 500,
        validFrom: now,
        validTo: inThirtyDays,
        isActive: true,
        serviceIds: [services[4]!.id],
      },
      {
        title: "New Client Welcome",
        description: "15% off your first hair service at Queen's.",
        discountPercent: 15,
        validFrom: now,
        validTo: inThirtyDays,
        isActive: true,
        serviceIds: [services[0]!.id, services[1]!.id],
      },
    ],
  });

  console.log("Offers seeded");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
