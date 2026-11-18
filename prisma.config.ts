import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    // Generation does not need a live URL; migrations do and will fail clearly if unset.
    url: process.env.DATABASE_URL ?? '',
  },
});
