import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { ACCESS_COOKIE, CSRF_COOKIE } from './common/cookies.js';

/** Application-wide bootstrap configuration. */
export function configureApp(app: INestApplication): void {
  app.use(cookieParser());
  app.setGlobalPrefix('api', { exclude: ['health', 'health/{*path}'] });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('SSFB API')
    .setDescription(
      `Session auth uses httpOnly cookies. Send the ${CSRF_COOKIE} value as an ` +
        'X-CSRF-Token header on state-changing requests, or use a Bearer access token.',
    )
    .setVersion('0.1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .addCookieAuth(ACCESS_COOKIE)
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
