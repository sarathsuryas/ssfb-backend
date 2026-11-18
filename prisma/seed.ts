import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';
import { PrismaClient, Role } from '../src/generated/prisma/client.js';

const databaseUrl = process.env.DATABASE_URL;
const email = process.env.SEED_ADMIN_EMAIL;
const password = process.env.SEED_ADMIN_PASSWORD;

if (!databaseUrl || !email || !password) {
  throw new Error(
    'DATABASE_URL, SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD are required to seed',
  );
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

async function main(): Promise<void> {
  const normalizedEmail = email!.trim().toLowerCase();
  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existing) {
    if (existing.role !== Role.ADMIN) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { role: Role.ADMIN },
      });
      console.log(`Promoted ${normalizedEmail} to ADMIN`);
    } else {
      console.log(`${normalizedEmail} is already an ADMIN`);
    }
    return;
  }

  await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash: await bcrypt.hash(password!, 12),
      role: Role.ADMIN,
    },
  });
  console.log(`Created ADMIN ${normalizedEmail}`);
}

await main();
await prisma.$disconnect();
