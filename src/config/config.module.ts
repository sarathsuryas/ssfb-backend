import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import configuration from './configuration.js';
import { validateEnv } from './env.validation.js';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnv,
      load: [configuration],
    }),
  ],
})
export class AppConfigModule {}
