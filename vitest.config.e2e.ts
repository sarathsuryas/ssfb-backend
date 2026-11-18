import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
    env: {
      NODE_ENV: 'test',
      DATABASE_URL:
        'postgresql://user:pass@localhost:5432/ssfb_test?schema=public',
      JWT_SECRET: 'test-secret-at-least-16-characters',
    },
  },
});
