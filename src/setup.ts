import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/** Shared bootstrap configuration so tests exercise the same setup as the server. */
export function configureApp(app: INestApplication): void {
  app.setGlobalPrefix('api', { exclude: ['health', 'health/*'] });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('SSFB API')
    .setDescription('Backend API for SSFB')
    .setVersion('0.1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .build();

  SwaggerModule.setup(
    'docs',
    app,
    SwaggerModule.createDocument(app, swaggerConfig),
    {
      swaggerOptions: { persistAuthorization: true },
    },
  );
}
