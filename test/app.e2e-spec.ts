import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/database/prisma.service.js';
import { configureApp } from '../src/setup.js';

describe('App (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue({
        $connect: async () => {},
        $disconnect: async () => {},
        $queryRaw: async () => [{ ok: 1 }],
      })
      .compile();

    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('serves public service metadata under the /api prefix', async () => {
    const response = await request(app.getHttpServer()).get('/api').expect(200);

    expect(response.body.data).toMatchObject({
      name: 'ssfb-backend',
      docs: '/docs',
    });
  });

  it('exposes the liveness probe outside the /api prefix', async () => {
    const response = await request(app.getHttpServer())
      .get('/health')
      .expect(200);

    expect(response.body.data.status).toBe('ok');
  });

  it('checks the database on the readiness probe', async () => {
    const response = await request(app.getHttpServer())
      .get('/health/ready')
      .expect(200);

    expect(response.body.data).toEqual({ status: 'ok', database: 'up' });
  });

  it('serves the OpenAPI document', async () => {
    await request(app.getHttpServer()).get('/docs-json').expect(200);
  });

  it('applies the global error envelope to unknown routes', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/does-not-exist')
      .expect(404);

    expect(response.body).toMatchObject({
      statusCode: 404,
      path: '/api/does-not-exist',
    });
  });
});
